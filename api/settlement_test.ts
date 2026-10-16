import { computeSettlement } from "./settlement.ts";

function assertEquals<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

Deno.test("example night: losers split 80k on a 1M bill", () => {
  const result = computeSettlement(
    1_000_000,
    [
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" },
      { id: "d", name: "D" },
    ],
    [
      {
        id: "m1",
        date: new Date("2026-10-16T00:00:00.000Z"),
        betAmount: 80_000,
        winner: "A",
        players: [
          { memberId: "a", name: "A", team: "A" },
          { memberId: "b", name: "B", team: "A" },
          { memberId: "c", name: "C", team: "B" },
          { memberId: "d", name: "D", team: "B" },
        ],
      },
    ],
  );

  assertEquals(result.s0, 1_000_000, "s0");
  assertEquals(result.s1, 80_000, "s1");
  assertEquals(result.s2, 920_000, "s2");
  assertEquals(result.a0, 230_000, "a0");
  const byName = Object.fromEntries(result.rows.map((row) => [row.name, row]));
  assertEquals(byName.A.total, 230_000, "A");
  assertEquals(byName.B.total, 230_000, "B");
  assertEquals(byName.C.total, 270_000, "C");
  assertEquals(byName.D.total, 270_000, "D");
  assertEquals(
    result.rows.reduce((sum, row) => sum + row.total, 0),
    1_000_000,
    "sum",
  );
});
