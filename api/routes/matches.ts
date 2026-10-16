import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, type AppEnv } from "../auth.ts";
import { invalidateUserReads } from "../cache.ts";
import { calendarDayToUtc } from "../dates.ts";
import { prisma } from "../db.ts";
import { readBody } from "../http.ts";
import { ownedMatch, ownedParty } from "../ownership.ts";
import { partyDetailInclude, serializeParty } from "../partyInclude.ts";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const teamSchema = z.array(z.string().min(1)).min(1).max(100);

const matchSchema = z.object({
  date: dateSchema,
  betAmount: z.coerce.number().finite(),
  notes: z.string().trim().max(2000).optional().default(""),
  teamA: teamSchema,
  teamB: teamSchema,
  winner: z.enum(["A", "B"]),
});

function validateTeams(memberIds: Set<string>, teamA: string[], teamB: string[]) {
  const a = [...new Set(teamA)];
  const b = [...new Set(teamB)];
  if (a.length === 0 || b.length === 0) return "Each team needs at least one member";
  const overlap = a.filter((id) => b.includes(id));
  if (overlap.length > 0) return "A member cannot be on both teams";
  for (const id of [...a, ...b]) {
    if (!memberIds.has(id)) return "Unknown member";
  }
  return { teamA: a, teamB: b };
}

async function ownedMemberIds(userId: string) {
  const members = await prisma.member.findMany({
    where: { userId },
    select: { id: true },
  });
  return new Set(members.map((row) => row.id));
}

export const nestedMatchRoutes = new Hono<AppEnv>();
nestedMatchRoutes.use("*", authMiddleware);

nestedMatchRoutes.post("/:partyId/matches", async (c) => {
  const parsed = await readBody(c, matchSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const partyId = c.req.param("partyId");
  const existing = await ownedParty(userId, partyId);
  if (!existing) return c.json({ error: "Not found" }, 404);
  const memberIds = await ownedMemberIds(userId);
  const teams = validateTeams(memberIds, parsed.data.teamA, parsed.data.teamB);
  if (typeof teams === "string") return c.json({ error: teams }, 400);

  await prisma.match.create({
    data: {
      partyId,
      date: calendarDayToUtc(parsed.data.date),
      betAmount: Math.round(parsed.data.betAmount),
      winner: parsed.data.winner,
      notes: parsed.data.notes,
      players: {
        create: [
          ...teams.teamA.map((memberId) => ({ memberId, team: "A" })),
          ...teams.teamB.map((memberId) => ({ memberId, team: "B" })),
        ],
      },
    },
  });
  invalidateUserReads(userId);
  const updated = await prisma.party.findFirst({
    where: { id: partyId },
    include: partyDetailInclude,
  });
  return c.json({ party: serializeParty(updated!) }, 201);
});

export const matchRoutes = new Hono<AppEnv>();
matchRoutes.use("*", authMiddleware);

matchRoutes.patch("/:id", async (c) => {
  const parsed = await readBody(c, matchSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const existing = await ownedMatch(userId, id);
  if (!existing) return c.json({ error: "Not found" }, 404);
  const memberIds = await ownedMemberIds(userId);
  const teams = validateTeams(memberIds, parsed.data.teamA, parsed.data.teamB);
  if (typeof teams === "string") return c.json({ error: teams }, 400);

  await prisma.$transaction(async (tx) => {
    await tx.matchPlayer.deleteMany({ where: { matchId: id } });
    await tx.match.update({
      where: { id },
      data: {
        date: calendarDayToUtc(parsed.data.date),
        betAmount: Math.round(parsed.data.betAmount),
        winner: parsed.data.winner,
        notes: parsed.data.notes,
        players: {
          create: [
            ...teams.teamA.map((memberId) => ({ memberId, team: "A" })),
            ...teams.teamB.map((memberId) => ({ memberId, team: "B" })),
          ],
        },
      },
    });
  });
  invalidateUserReads(userId);
  const updated = await prisma.party.findFirst({
    where: { id: existing.partyId },
    include: partyDetailInclude,
  });
  return c.json({ party: serializeParty(updated!) });
});

matchRoutes.delete("/:id", async (c) => {
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const existing = await ownedMatch(userId, id);
  if (!existing) return c.json({ error: "Not found" }, 404);
  await prisma.match.delete({ where: { id } });
  invalidateUserReads(userId);
  const updated = await prisma.party.findFirst({
    where: { id: existing.partyId },
    include: partyDetailInclude,
  });
  return c.json({ party: serializeParty(updated!) });
});
