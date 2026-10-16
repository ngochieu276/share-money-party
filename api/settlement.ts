export type Team = "A" | "B";

export type SettlementPlayer = {
  memberId: string;
  name: string;
  team: Team;
};

export type SettlementMatch = {
  id: string;
  date: Date;
  betAmount: number;
  winner: Team;
  notes: string;
  players: SettlementPlayer[];
};

export type SettlementAttendee = {
  id: string;
  name: string;
};

export type BettingLossEntry = {
  matchId: string;
  amount: number;
  date: Date;
  betAmount: number;
  winner: Team;
  notes: string;
  teamA: string[];
  teamB: string[];
};

export type SettlementRow = {
  memberId: string;
  name: string;
  attended: boolean;
  baseAmount: number;
  bettingLoss: number;
  losses: BettingLossEntry[];
  total: number;
};

export type Settlement = {
  s0: number;
  s1: number;
  s2: number;
  a0: number;
  n: number;
  rows: SettlementRow[];
};

/** Split an integer total across n parts so the parts sum back to total. */
export function splitInteger(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.trunc(total / n);
  const remainder = total - base * n;
  const parts = Array.from({ length: n }, () => base);
  if (remainder >= 0) {
    for (let i = 0; i < remainder; i++) parts[i] += 1;
  } else {
    for (let i = 0; i < -remainder; i++) parts[i] -= 1;
  }
  return parts;
}

export function losingTeam(winner: Team): Team {
  return winner === "A" ? "B" : "A";
}

export function computeSettlement(
  totalBill: number,
  attendees: SettlementAttendee[],
  matches: SettlementMatch[],
): Settlement {
  const attendeeIds = new Set(attendees.map((row) => row.id));
  const people = new Map<string, SettlementAttendee>();
  for (const attendee of attendees) people.set(attendee.id, attendee);
  for (const match of matches) {
    for (const player of match.players) {
      if (!people.has(player.memberId)) {
        people.set(player.memberId, { id: player.memberId, name: player.name });
      }
    }
  }

  const n = attendees.length;
  const s0 = totalBill;
  const s1 = matches.reduce((sum, match) => sum + match.betAmount, 0);
  const s2 = s0 - s1;
  const attendeeOrder = [...attendees].sort((a, b) => a.id.localeCompare(b.id));
  const bases = splitInteger(s2, n);
  const baseById = new Map<string, number>();
  attendeeOrder.forEach((attendee, index) => {
    baseById.set(attendee.id, bases[index] ?? 0);
  });

  const lossesByMember = new Map<string, BettingLossEntry[]>();
  for (const person of people.values()) lossesByMember.set(person.id, []);

  for (const match of matches) {
    const lost = losingTeam(match.winner);
    const teamA = match.players
      .filter((player) => player.team === "A")
      .map((player) => player.name);
    const teamB = match.players
      .filter((player) => player.team === "B")
      .map((player) => player.name);
    const losers = match.players
      .filter((player) => player.team === lost && lossesByMember.has(player.memberId))
      .sort((a, b) => a.memberId.localeCompare(b.memberId));
    const shares = splitInteger(match.betAmount, losers.length);
    losers.forEach((player, index) => {
      lossesByMember.get(player.memberId)?.push({
        matchId: match.id,
        amount: shares[index] ?? 0,
        date: match.date,
        betAmount: match.betAmount,
        winner: match.winner,
        notes: match.notes,
        teamA,
        teamB,
      });
    });
  }

  const rows: SettlementRow[] = [...people.values()].map((person) => {
    const attended = attendeeIds.has(person.id);
    const baseAmount = attended ? (baseById.get(person.id) ?? 0) : 0;
    const losses = lossesByMember.get(person.id) ?? [];
    const bettingLoss = losses.reduce((sum, entry) => sum + entry.amount, 0);
    return {
      memberId: person.id,
      name: person.name,
      attended,
      baseAmount,
      bettingLoss,
      losses,
      total: baseAmount + bettingLoss,
    };
  });

  rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  return { s0, s1, s2, a0: n > 0 ? Math.round(s2 / n) : 0, n, rows };
}
