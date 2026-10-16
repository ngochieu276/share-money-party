export type Locale = "en" | "vi";

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
  createdAt: string;
};

export type MatchPlayer = {
  memberId: string;
  name: string;
  team: "A" | "B";
};

export type Match = {
  id: string;
  date: string;
  betAmount: number;
  winner: "A" | "B";
  notes: string;
  createdAt: string;
  players: MatchPlayer[];
};

export type Party = {
  id: string;
  date: string;
  totalBill: number;
  createdAt: string;
  updatedAt: string;
  attendees: { id: string; name: string }[];
  matches: Match[];
};

export type BettingLossEntry = {
  matchId: string;
  amount: number;
  date: string;
  betAmount: number;
  winner: "A" | "B";
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

export type AuthResponse = {
  token: string;
  user: User;
};

export type MembersResponse = { members: Member[] };
export type PartiesResponse = { parties: Party[] };
export type PartyResponse = { party: Party };
export type SettlementResponse = { party: Party; settlement: Settlement };
export type UserResponse = { user: User };
