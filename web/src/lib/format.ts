"use client";

import { localeTag, t } from "@/i18n/useI18n";

export function calendarDay(iso: string): Date {
  const day = iso.slice(0, 10);
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, date ?? 1);
}

export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(localeTag(), {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatMoney(amount: number): string {
  const formatted = new Intl.NumberFormat(localeTag()).format(amount);
  return t("common.vnd", { amount: formatted });
}

export function todayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
