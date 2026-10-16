import { prisma } from "./db.ts";

export async function ownedParty(userId: string, partyId: string) {
  return await prisma.party.findFirst({
    where: { id: partyId, userId },
  });
}

export async function ownedMatch(userId: string, matchId: string) {
  return await prisma.match.findFirst({
    where: { id: matchId, party: { userId } },
    include: { party: true },
  });
}
