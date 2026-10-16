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
  players: SettlementPlayer[];
};

export type SettlementAttendee = {
  id: string;
  name: string;
};

export type SettlementRow = {
  memberId: string;
  name: string;
  baseAmount: number;
  bettingLoss: number;
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
  const n = attendees.length;
  const s0 = totalBill;
  const s1 = matches.reduce((sum, match) => sum + match.betAmount, 0);
  const s2 = s0 - s1;
  const bases = splitInteger(s2, n);
  const a0 = n > 0 ? bases[0] ?? 0 : 0;

  const lossByMember = new Map<string, number>();
  for (const attendee of attendees) lossByMember.set(attendee.id, 0);

  for (const match of matches) {
    const lost = losingTeam(match.winner);
    const losers = match.players
      .filter((player) => player.team === lost && lossByMember.has(player.memberId))
      .sort((a, b) => a.memberId.localeCompare(b.memberId));
    const shares = splitInteger(match.betAmount, losers.length);
    losers.forEach((player, index) => {
      lossByMember.set(
        player.memberId,
        (lossByMember.get(player.memberId) ?? 0) + (shares[index] ?? 0),
      );
    });
  }

  const ordered = [...attendees].sort((a, b) => a.id.localeCompare(b.id));
  const rows: SettlementRow[] = ordered.map((attendee, index) => {
    const baseAmount = bases[index] ?? 0;
    const bettingLoss = lossByMember.get(attendee.id) ?? 0;
    return {
      memberId: attendee.id,
      name: attendee.name,
      baseAmount,
      bettingLoss,
      total: baseAmount + bettingLoss,
    };
  });

  rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  return { s0, s1, s2, a0: n > 0 ? Math.round(s2 / n) : 0, n, rows };
}
