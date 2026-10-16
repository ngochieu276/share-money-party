"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayInput } from "@/lib/format";
import type { Member, Party } from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";
import { useEffect, useState } from "react";

export function PartyFormDialog({
  open,
  onOpenChange,
  title,
  members,
  party,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  members: Member[];
  party?: Party | null;
  pending?: boolean;
  onSubmit: (values: {
    date: string;
    totalBill: number;
    attendeeIds: string[];
  }) => void;
}) {
  const { t } = useI18n();
  const [date, setDate] = useState(todayInput());
  const [totalBill, setTotalBill] = useState("0");
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setDate(party ? party.date.slice(0, 10) : todayInput());
    setTotalBill(party ? String(party.totalBill) : "0");
    setAttendeeIds(party ? party.attendees.map((row) => row.id) : []);
  }, [open, party]);

  function toggle(id: string) {
    setAttendeeIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="party-form"
            disabled={pending || attendeeIds.length === 0}
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form
        id="party-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            date,
            totalBill: Number(totalBill) || 0,
            attendeeIds,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="party-date">{t("parties.date")}</Label>
            <Input
              id="party-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="party-bill">{t("parties.totalBill")}</Label>
            <Input
              id="party-bill"
              type="number"
              min={0}
              step={1000}
              value={totalBill}
              onChange={(event) => setTotalBill(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("parties.selectMembers")}</Label>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("parties.needMembers")}</p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
              {members.map((member) => (
                <label key={member.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={attendeeIds.includes(member.id)}
                    onCheckedChange={() => toggle(member.id)}
                  />
                  {member.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </form>
    </FormDialog>
  );
}
