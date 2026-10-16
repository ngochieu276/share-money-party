"use client";

import { useI18n } from "@/i18n/useI18n";

export function PageLoading() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      {t("common.loading")}
    </div>
  );
}
