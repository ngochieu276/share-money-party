"use client";

import { ListPlaceholder } from "@/components/layout/ListPlaceholder";
import { Page } from "@/components/layout/Page";
import { PageLoading } from "@/components/layout/PageLoading";
import { MatchFormDialog } from "@/components/parties/MatchFormDialog";
import { MatchList } from "@/components/parties/MatchList";
import { PartyFormDialog } from "@/components/parties/PartyFormDialog";
import { SettlementTable } from "@/components/parties/SettlementTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type {
  Match,
  MembersResponse,
  Party,
  PartyResponse,
  SettlementResponse,
} from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";
import { APP_HOME } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type MatchPayload = {
  date: string;
  betAmount: number;
  notes: string;
  teamA: string[];
  teamB: string[];
  winner: "A" | "B";
};

export function PartyDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const partyQuery = useQuery({
    queryKey: ["party", id],
    queryFn: () => api<PartyResponse>(`/parties/${id}`),
  });
  const settlementQuery = useQuery({
    queryKey: ["settlement", id],
    queryFn: () => api<SettlementResponse>(`/parties/${id}/settlement`),
  });
  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: () => api<MembersResponse>("/members"),
  });

  function applyParty(party: Party) {
    queryClient.setQueryData(["party", id], { party });
    void queryClient.invalidateQueries({ queryKey: ["settlement", id] });
    void queryClient.invalidateQueries({ queryKey: ["parties"] });
  }

  const updateParty = useMutation({
    mutationFn: (values: { date: string; totalBill: number; attendeeIds: string[] }) =>
      api<PartyResponse>(`/parties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: async (data) => {
      applyParty(data.party);
      setEditOpen(false);
      toast.success(t("parties.updated"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const updateAttendance = useMutation({
    mutationFn: (attendeeIds: string[]) =>
      api<PartyResponse>(`/parties/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ attendeeIds }),
      }),
    onSuccess: (data) => applyParty(data.party),
    onError: (err) => toast.error(errorMessage(err)),
  });

  const deleteParty = useMutation({
    mutationFn: () => api(`/parties/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success(t("parties.deleted"));
      router.replace(APP_HOME);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const createMatch = useMutation({
    mutationFn: (values: MatchPayload) =>
      api<PartyResponse>(`/parties/${id}/matches`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      applyParty(data.party);
      setMatchOpen(false);
      toast.success(t("matches.created"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const updateMatch = useMutation({
    mutationFn: ({ matchId, values }: { matchId: string; values: MatchPayload }) =>
      api<PartyResponse>(`/matches/${matchId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      applyParty(data.party);
      setEditingMatch(null);
      toast.success(t("matches.updated"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const deleteMatch = useMutation({
    mutationFn: (matchId: string) => api<PartyResponse>(`/matches/${matchId}`, { method: "DELETE" }),
    onSuccess: (data) => {
      applyParty(data.party);
      toast.success(t("matches.deleted"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const party = partyQuery.data?.party;
  const settlement = settlementQuery.data?.settlement;

  if (partyQuery.isLoading) {
    return (
      <Page>
        <PageLoading />
      </Page>
    );
  }

  if (!party) {
    return (
      <Page>
        <ListPlaceholder>{t("errors.notFound")}</ListPlaceholder>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <Link
            href={APP_HOME}
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("common.back")}
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-progress">
            {t("parties.detailKicker")}
          </p>
          <h1 className="mt-1 font-serif text-3xl">{formatDate(party.date)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {party.attendees.map((row) => row.name).join(" · ")}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t("common.more")}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              {t("parties.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <section className="mb-10">
        <h2 className="mb-1 font-serif text-2xl">{t("settlement.title")}</h2>
        {settlement ? (
          <SettlementTable
            settlement={settlement}
            pending={updateAttendance.isPending}
            onToggleAttended={(memberId, attended) => {
              const ids = new Set(party.attendees.map((row) => row.id));
              if (attended) ids.add(memberId);
              else ids.delete(memberId);
              updateAttendance.mutate([...ids]);
            }}
          />
        ) : (
          <PageLoading />
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{t("matches.title")}</h2>
          <Button onClick={() => setMatchOpen(true)}>{t("matches.add")}</Button>
        </div>
        {party.matches.length === 0 ? (
          <ListPlaceholder>{t("matches.empty")}</ListPlaceholder>
        ) : (
          <MatchList
            matches={party.matches}
            onEdit={setEditingMatch}
            onDelete={(match) => deleteMatch.mutate(match.id)}
          />
        )}
      </section>

      <PartyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t("parties.edit")}
        members={membersQuery.data?.members ?? []}
        party={party}
        pending={updateParty.isPending}
        onSubmit={(values) => updateParty.mutate(values)}
      />
      <MatchFormDialog
        open={matchOpen || editingMatch !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMatchOpen(false);
            setEditingMatch(null);
          }
        }}
        party={party}
        members={membersQuery.data?.members ?? []}
        match={editingMatch}
        pending={createMatch.isPending || updateMatch.isPending}
        onSubmit={(values) => {
          if (editingMatch) {
            updateMatch.mutate({ matchId: editingMatch.id, values });
          } else {
            createMatch.mutate(values);
          }
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("parties.deleteTitle")}
        body={t("parties.deleteBody")}
        pending={deleteParty.isPending}
        onConfirm={() => deleteParty.mutate()}
      />
    </Page>
  );
}
