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
  betAmount: z.number().int().min(1).max(1_000_000_000),
  teamA: teamSchema,
  teamB: teamSchema,
  winner: z.enum(["A", "B"]),
});

function validateTeams(attendeeIds: Set<string>, teamA: string[], teamB: string[]) {
  const a = [...new Set(teamA)];
  const b = [...new Set(teamB)];
  if (a.length === 0 || b.length === 0) return "Each team needs at least one member";
  const overlap = a.filter((id) => b.includes(id));
  if (overlap.length > 0) return "A member cannot be on both teams";
  for (const id of [...a, ...b]) {
    if (!attendeeIds.has(id)) return "Match players must attend the party";
  }
  return { teamA: a, teamB: b };
}

async function partyWithAttendees(partyId: string) {
  return await prisma.party.findUnique({
    where: { id: partyId },
    include: { attendees: true },
  });
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
  const party = await partyWithAttendees(partyId);
  if (!party) return c.json({ error: "Not found" }, 404);
  const attendeeIds = new Set(party.attendees.map((row) => row.memberId));
  const teams = validateTeams(attendeeIds, parsed.data.teamA, parsed.data.teamB);
  if (typeof teams === "string") return c.json({ error: teams }, 400);

  await prisma.match.create({
    data: {
      partyId,
      date: calendarDayToUtc(parsed.data.date),
      betAmount: parsed.data.betAmount,
      winner: parsed.data.winner,
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
  const party = await partyWithAttendees(existing.partyId);
  if (!party) return c.json({ error: "Not found" }, 404);
  const attendeeIds = new Set(party.attendees.map((row) => row.memberId));
  const teams = validateTeams(attendeeIds, parsed.data.teamA, parsed.data.teamB);
  if (typeof teams === "string") return c.json({ error: teams }, 400);

  await prisma.$transaction(async (tx) => {
    await tx.matchPlayer.deleteMany({ where: { matchId: id } });
    await tx.match.update({
      where: { id },
      data: {
        date: calendarDayToUtc(parsed.data.date),
        betAmount: parsed.data.betAmount,
        winner: parsed.data.winner,
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
