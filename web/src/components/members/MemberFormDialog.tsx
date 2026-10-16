"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/useI18n";
import { useEffect, useState } from "react";

export function MemberFormDialog({
  open,
  onOpenChange,
  title,
  initialName,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialName?: string;
  pending?: boolean;
  onSubmit: (name: string) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName ?? "");

  useEffect(() => {
    if (open) setName(initialName ?? "");
  }, [open, initialName]);

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
            form="member-form"
            disabled={pending || name.trim().length === 0}
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form
        id="member-form"
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(name.trim());
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="member-name">{t("members.name")}</Label>
          <Input
            id="member-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
          />
        </div>
      </form>
    </FormDialog>
  );
}
