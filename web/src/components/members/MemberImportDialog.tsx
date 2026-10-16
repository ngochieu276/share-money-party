"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/useI18n";
import { useEffect, useState } from "react";

export function parseNames(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,;]+/)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
}

export function MemberImportDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending?: boolean;
  onSubmit: (names: string[]) => void;
}) {
  const { t } = useI18n();
  const [raw, setRaw] = useState("");

  useEffect(() => {
    if (open) setRaw("");
  }, [open]);

  const names = parseNames(raw);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("members.importTitle")}
      description={t("members.importBody")}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="import-form"
            disabled={pending || names.length === 0}
          >
            {t("members.import")}
          </Button>
        </>
      }
    >
      <form
        id="import-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(names);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="import-names">{t("members.name")}</Label>
          <Textarea
            id="import-names"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            placeholder={t("members.importPlaceholder")}
            rows={8}
          />
        </div>
      </form>
    </FormDialog>
  );
}
