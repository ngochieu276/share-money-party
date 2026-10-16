"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayInput } from "@/lib/format";
import type { Match, Party } from "@/lib/types";
import { selectClass } from "@/lib/utils";
import { useI18n } from "@/i18n/useI18n";
import { useEffect, useState } from "react";

export function MatchFormDialog({
  open,
  onOpenChange,
  party,
  match,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: Party;
  match?: Match | null;
  pending?: boolean;
  onSubmit: (values: {
    date: string;
    betAmount: number;
    teamA: string[];
    teamB: string[];
    winner: "A" | "B";
  }) => void;
}) {
  const { t } = useI18n();
  const [date, setDate] = useState(todayInput());
  const [betAmount, setBetAmount] = useState("0");
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [winner, setWinner] = useState<"A" | "B">("A");

  useEffect(() => {
    if (!open) return;
    setDate(match ? match.date.slice(0, 10) : party.date.slice(0, 10));
    setBetAmount(match ? String(match.betAmount) : "");
    setTeamA(
      match
        ? match.players.filter((p) => p.team === "A").map((p) => p.memberId)
        : [],
    );
    setTeamB(
      match
        ? match.players.filter((p) => p.team === "B").map((p) => p.memberId)
        : [],
    );
    setWinner(match?.winner ?? "A");
  }, [open, match, party.date]);

  function toggle(team: "A" | "B", id: string) {
    if (team === "A") {
      setTeamA((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
      setTeamB((current) => current.filter((item) => item !== id));
    } else {
      setTeamB((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
      setTeamA((current) => current.filter((item) => item !== id));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={match ? t("matches.edit") : t("matches.add")}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="match-form"
            disabled={pending || teamA.length === 0 || teamB.length === 0}
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form
        id="match-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            date,
            betAmount: Number(betAmount) || 0,
            teamA,
            teamB,
            winner,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="match-date">{t("matches.date")}</Label>
            <Input
              id="match-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="match-bet">{t("matches.betAmount")}</Label>
            <Input
              id="match-bet"
              type="number"
              min={1}
              step={1000}
              value={betAmount}
              onChange={(event) => setBetAmount(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeamColumn
            title={t("matches.teamA")}
            attendees={party.attendees}
            selected={teamA}
            onToggle={(id) => toggle("A", id)}
          />
          <TeamColumn
            title={t("matches.teamB")}
            attendees={party.attendees}
            selected={teamB}
            onToggle={(id) => toggle("B", id)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="match-winner">{t("matches.winner")}</Label>
          <select
            id="match-winner"
            className={selectClass}
            value={winner}
            onChange={(event) => setWinner(event.target.value as "A" | "B")}
          >
            <option value="A">{t("matches.winnerA")}</option>
            <option value="B">{t("matches.winnerB")}</option>
          </select>
        </div>
      </form>
    </FormDialog>
  );
}

function TeamColumn({
  title,
  attendees,
  selected,
  onToggle,
}: {
  title: string;
  attendees: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
        {attendees.map((member) => (
          <label key={member.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(member.id)}
              onCheckedChange={() => onToggle(member.id)}
            />
            {member.name}
          </label>
        ))}
      </div>
    </div>
  );
}
