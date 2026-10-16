"use client";

import { ListPlaceholder } from "@/components/layout/ListPlaceholder";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/layout/PageLoading";
import { PartyFormDialog } from "@/components/parties/PartyFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import type { MembersResponse, PartiesResponse, PartyResponse } from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function PartiesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const partiesQuery = useQuery({
    queryKey: ["parties"],
    queryFn: () => api<PartiesResponse>("/parties"),
  });
  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: () => api<MembersResponse>("/members"),
  });

  const create = useMutation({
    mutationFn: (values: { date: string; totalBill: number; attendeeIds: string[] }) =>
      api<PartyResponse>("/parties", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["parties"] });
      setOpen(false);
      toast.success(t("parties.created"));
      router.push(`/parties/${data.party.id}`);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const parties = partiesQuery.data?.parties ?? [];

  return (
    <Page>
      <PageHeader
        title={t("parties.title")}
        subtitle={t("parties.subtitle")}
        actions={<Button onClick={() => setOpen(true)}>{t("parties.add")}</Button>}
      />
      {partiesQuery.isLoading ? (
        <PageLoading />
      ) : parties.length === 0 ? (
        <ListPlaceholder>{t("parties.empty")}</ListPlaceholder>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {parties.map((party) => (
            <Card
              key={party.id}
              className="cursor-pointer transition-colors hover:bg-accent/40"
              onClick={() => router.push(`/parties/${party.id}`)}
            >
              <CardHeader>
                <CardTitle className="font-serif text-xl">{formatDate(party.date)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{formatMoney(party.totalBill)}</p>
                <p className="mt-1">
                  {t("parties.attendeeCount", { count: party.attendees.length })}
                  {" · "}
                  {t("parties.matchCount", { count: party.matches.length })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PartyFormDialog
        open={open}
        onOpenChange={setOpen}
        title={t("parties.add")}
        members={membersQuery.data?.members ?? []}
        pending={create.isPending}
        onSubmit={(values) => create.mutate(values)}
      />
    </Page>
  );
}
