"use client";

import { ListPlaceholder } from "@/components/layout/ListPlaceholder";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/layout/PageLoading";
import { MemberFormDialog } from "@/components/members/MemberFormDialog";
import { MemberImportDialog } from "@/components/members/MemberImportDialog";
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
import type { Member, MembersResponse } from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function MembersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: () => api<MembersResponse>("/members"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["members"] });

  const create = useMutation({
    mutationFn: (name: string) =>
      api("/members", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: async () => {
      await invalidate();
      setCreateOpen(false);
      toast.success(t("members.created"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const importMembers = useMutation({
    mutationFn: (names: string[]) =>
      api("/members/import", { method: "POST", body: JSON.stringify({ names }) }),
    onSuccess: async () => {
      await invalidate();
      setImportOpen(false);
      toast.success(t("members.imported"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api(`/members/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
    onSuccess: async () => {
      await invalidate();
      setEditing(null);
      toast.success(t("members.updated"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/members/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidate();
      setDeleting(null);
      toast.success(t("members.deleted"));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const members = membersQuery.data?.members ?? [];

  return (
    <Page>
      <PageHeader
        title={t("members.title")}
        subtitle={t("members.subtitle")}
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              {t("members.import")}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>{t("members.add")}</Button>
          </>
        }
      />
      {membersQuery.isLoading ? (
        <PageLoading />
      ) : members.length === 0 ? (
        <ListPlaceholder>{t("members.empty")}</ListPlaceholder>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{member.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("common.more")}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(member)}>
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleting(member)}>
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      <MemberFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("members.add")}
        pending={create.isPending}
        onSubmit={(name) => create.mutate(name)}
      />
      <MemberFormDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t("members.edit")}
        initialName={editing?.name}
        pending={update.isPending}
        onSubmit={(name) => {
          if (editing) update.mutate({ id: editing.id, name });
        }}
      />
      <MemberImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        pending={importMembers.isPending}
        onSubmit={(names) => importMembers.mutate(names)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={t("members.deleteTitle")}
        body={t("members.deleteBody", { name: deleting?.name ?? "" })}
        pending={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id);
        }}
      />
    </Page>
  );
}
