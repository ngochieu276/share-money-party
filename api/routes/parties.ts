import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, type AppEnv } from "../auth.ts";
import { cachedRead, invalidateUserReads } from "../cache.ts";
import { calendarDayToUtc } from "../dates.ts";
import { prisma } from "../db.ts";
import { readBody } from "../http.ts";
import { ownedParty } from "../ownership.ts";
import { partyDetailInclude, serializeParty } from "../partyInclude.ts";
import { computeSettlement, type Team } from "../settlement.ts";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createSchema = z.object({
  date: dateSchema,
  totalBill: z.coerce.number().finite().optional(),
  attendeeIds: z.array(z.string().min(1)).min(1).max(200),
});

const updateSchema = z.object({
  date: dateSchema.optional(),
  totalBill: z.coerce.number().finite().optional(),
  attendeeIds: z.array(z.string().min(1)).max(200).optional(),
});

export const partyRoutes = new Hono<AppEnv>();
partyRoutes.use("*", authMiddleware);

async function assertOwnedMembers(userId: string, ids: string[]) {
  const unique = [...new Set(ids)];
  const count = await prisma.member.count({
    where: { userId, id: { in: unique } },
  });
  return count === unique.length ? unique : null;
}

partyRoutes.get("/", async (c) => {
  const userId = c.get("user").id;
  const parties = await cachedRead(userId, "parties", async () => {
    const rows = await prisma.party.findMany({
      where: { userId },
      include: partyDetailInclude,
      orderBy: { date: "desc" },
    });
    return rows.map(serializeParty);
  });
  return c.json({ parties });
});

partyRoutes.post("/", async (c) => {
  const parsed = await readBody(c, createSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const attendeeIds = await assertOwnedMembers(userId, parsed.data.attendeeIds);
  if (!attendeeIds) return c.json({ error: "Unknown member" }, 400);
  const party = await prisma.party.create({
    data: {
      userId,
      date: calendarDayToUtc(parsed.data.date),
      totalBill: Math.round(parsed.data.totalBill ?? 0),
      attendees: {
        create: attendeeIds.map((memberId) => ({ memberId })),
      },
    },
    include: partyDetailInclude,
  });
  invalidateUserReads(userId);
  return c.json({ party: serializeParty(party) }, 201);
});

partyRoutes.get("/:id", async (c) => {
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const party = await cachedRead(userId, `party:${id}`, async () => {
    const row = await prisma.party.findFirst({
      where: { id, userId },
      include: partyDetailInclude,
    });
    return row ? serializeParty(row) : null;
  });
  if (!party) return c.json({ error: "Not found" }, 404);
  return c.json({ party });
});

partyRoutes.patch("/:id", async (c) => {
  const parsed = await readBody(c, updateSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const existing = await ownedParty(userId, id);
  if (!existing) return c.json({ error: "Not found" }, 404);

  let attendeeIds: string[] | undefined;
  if (parsed.data.attendeeIds) {
    const owned = await assertOwnedMembers(userId, parsed.data.attendeeIds);
    if (!owned) return c.json({ error: "Unknown member" }, 400);
    attendeeIds = owned;
  }

  const party = await prisma.$transaction(async (tx) => {
    if (attendeeIds) {
      await tx.partyAttendee.deleteMany({
        where: { partyId: id, memberId: { notIn: attendeeIds } },
      });
      await tx.partyAttendee.createMany({
        data: attendeeIds.map((memberId) => ({ partyId: id, memberId })),
        skipDuplicates: true,
      });
    }

    return await tx.party.update({
      where: { id },
      data: {
        date: parsed.data.date ? calendarDayToUtc(parsed.data.date) : undefined,
        totalBill: parsed.data.totalBill === undefined
          ? undefined
          : Math.round(parsed.data.totalBill),
      },
      include: partyDetailInclude,
    });
  });

  invalidateUserReads(userId);
  return c.json({ party: serializeParty(party) });
});

partyRoutes.delete("/:id", async (c) => {
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const existing = await ownedParty(userId, id);
  if (!existing) return c.json({ error: "Not found" }, 404);
  await prisma.party.delete({ where: { id } });
  invalidateUserReads(userId);
  return c.json({ ok: true });
});

partyRoutes.get("/:id/settlement", async (c) => {
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const party = await prisma.party.findFirst({
    where: { id, userId },
    include: partyDetailInclude,
  });
  if (!party) return c.json({ error: "Not found" }, 404);
  const serialized = serializeParty(party);
  const settlement = computeSettlement(
    serialized.totalBill,
    serialized.attendees,
    serialized.matches.map((match) => ({
      id: match.id,
      date: new Date(match.date),
      betAmount: match.betAmount,
      winner: match.winner as Team,
      notes: match.notes,
      players: match.players.map((player) => ({
        memberId: player.memberId,
        name: player.name,
        team: player.team as Team,
      })),
    })),
  );
  return c.json({ party: serialized, settlement });
});
