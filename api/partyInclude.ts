export const partyDetailInclude = {
  attendees: {
    include: { member: true },
  },
  matches: {
    include: {
      players: { include: { member: true } },
    },
    orderBy: { date: "asc" as const },
  },
};

export function serializeParty(
  party: {
    id: string;
    date: Date;
    totalBill: number;
    createdAt: Date;
    updatedAt: Date;
    attendees: { member: { id: string; name: string } }[];
    matches?: {
      id: string;
      date: Date;
      betAmount: number;
      winner: string;
      notes: string;
      createdAt: Date;
      players: { team: string; member: { id: string; name: string } }[];
    }[];
  },
) {
  return {
    id: party.id,
    date: party.date.toISOString(),
    totalBill: party.totalBill,
    createdAt: party.createdAt.toISOString(),
    updatedAt: party.updatedAt.toISOString(),
    attendees: party.attendees
      .map((row) => ({ id: row.member.id, name: row.member.name }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    matches: (party.matches ?? []).map((match) => ({
      id: match.id,
      date: match.date.toISOString(),
      betAmount: match.betAmount,
      winner: match.winner,
      notes: match.notes,
      createdAt: match.createdAt.toISOString(),
      players: match.players.map((player) => ({
        memberId: player.member.id,
        name: player.member.name,
        team: player.team,
      })),
    })),
  };
}
