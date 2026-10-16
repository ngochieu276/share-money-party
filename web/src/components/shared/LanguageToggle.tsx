"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      aria-label={t("nav.language")}
      onClick={() => setLocale(locale === "en" ? "vi" : "en")}
    >
      {locale === "en" ? "EN" : "VI"}
    </Button>
  );
}
