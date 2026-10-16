"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatMoney } from "@/lib/format";
import type { Match } from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function MatchList({
  matches,
  onEdit,
  onDelete,
}: {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
}) {
  const { t } = useI18n();
  const [pending, setPending] = useState<Match | null>(null);

  return (
    <>
      <ul className="space-y-3">
        {matches.map((match) => {
          const teamA = match.players.filter((p) => p.team === "A");
          const teamB = match.players.filter((p) => p.team === "B");
          return (
            <li
              key={match.id}
              className="rounded-xl border bg-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{formatDate(match.date)}</p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">
                      {teamA.map((p) => p.name).join(", ")}
                    </span>
                    <span className="mx-2 text-muted-foreground">{t("matches.vs")}</span>
                    <span className="font-medium">
                      {teamB.map((p) => p.name).join(", ")}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatMoney(match.betAmount)}</Badge>
                    <Badge className="bg-hit text-primary-foreground">
                      {match.winner === "A" ? t("matches.winnerA") : t("matches.winnerB")}
                    </Badge>
                    <span className="text-xs text-miss">
                      {t("matches.lost", { amount: formatMoney(match.betAmount) })}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("common.more")}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(match)}>
                      {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setPending(match)}
                    >
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={t("matches.deleteTitle")}
        body={t("matches.deleteBody")}
        onConfirm={() => {
          if (pending) onDelete(pending);
          setPending(null);
        }}
      />
    </>
  );
}
