"use client";

import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/FormDialog";
import { useI18n } from "@/i18n/useI18n";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const { t } = useI18n();

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={body}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel ?? t("common.delete")}
          </Button>
        </>
      }
    >
      <span className="sr-only">{body}</span>
    </FormDialog>
  );
}
