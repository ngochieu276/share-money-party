"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatMoney } from "@/lib/format";
import type { BettingLossEntry, Settlement } from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";

export function SettlementTable({
  settlement,
  pending,
  onToggleAttended,
}: {
  settlement: Settlement;
  pending?: boolean;
  onToggleAttended: (memberId: string, attended: boolean) => void;
}) {
  const { t } = useI18n();
  const collected = settlement.rows.reduce((sum, row) => sum + row.total, 0);
  const balanced = collected === settlement.s0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label={t("settlement.bill")} value={formatMoney(settlement.s0)} />
        <Stat label={t("settlement.betting")} value={formatMoney(settlement.s1)} />
        <Stat label={t("settlement.remainder")} value={formatMoney(settlement.s2)} />
        <Stat label={t("settlement.base")} value={formatMoney(settlement.a0)} />
        <Stat label={t("settlement.attendees")} value={String(settlement.n)} />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("settlement.member")}</TableHead>
              <TableHead>{t("settlement.attended")}</TableHead>
              <TableHead className="text-right">{t("settlement.baseAmount")}</TableHead>
              <TableHead className="text-right">{t("settlement.bettingLoss")}</TableHead>
              <TableHead className="text-right">{t("settlement.total")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlement.rows.map((row) => (
              <TableRow key={row.memberId}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={row.attended}
                    disabled={pending}
                    aria-label={t("settlement.attended")}
                    onCheckedChange={(value) =>
                      onToggleAttended(row.memberId, value === true)
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  {row.attended ? formatMoney(row.baseAmount) : formatMoney(0)}
                </TableCell>
                <TableCell className="text-right">
                  <LossList losses={row.losses} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(row.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>{t("settlement.sum")}</TableCell>
              <TableCell />
              <TableCell className="text-right">{formatMoney(settlement.s2)}</TableCell>
              <TableCell className="text-right">{formatMoney(settlement.s1)}</TableCell>
              <TableCell className="text-right">{formatMoney(collected)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <Badge variant={balanced ? "secondary" : "destructive"}>
        {balanced ? t("settlement.balanced") : t("settlement.unbalanced")}
      </Badge>
    </div>
  );
}

function LossList({ losses }: { losses: BettingLossEntry[] }) {
  const { t } = useI18n();
  if (losses.length === 0) {
    return <span className="text-muted-foreground">{t("settlement.none")}</span>;
  }

  return (
    <ul className="flex flex-col items-end gap-1">
      {losses.map((loss) => (
        <li key={loss.matchId}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-miss underline decoration-dotted underline-offset-4"
              >
                {formatMoney(loss.amount)}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="max-w-xs border bg-card p-3 text-left text-card-foreground shadow-md"
            >
              <p className="font-medium">{t("settlement.hoverMatch")}</p>
              <p className="mt-1 text-muted-foreground">{formatDate(loss.date)}</p>
              <p className="mt-1">
                {loss.teamA.join(", ")}
                <span className="mx-1 text-muted-foreground">{t("matches.vs")}</span>
                {loss.teamB.join(", ")}
              </p>
              <p className="mt-1">
                {loss.winner === "A" ? t("matches.winnerA") : t("matches.winnerB")}
                {" · "}
                {formatMoney(loss.betAmount)}
              </p>
              {loss.notes ? (
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{loss.notes}</p>
              ) : null}
            </TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-lg">{value}</p>
    </div>
  );
}
