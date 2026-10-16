"use client";

import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";
import { useAuthStore } from "@/stores/auth";

type Vars = Record<string, string | number>;

function lookup(locale: "en" | "vi", path: string): string {
  const catalog = locale === "vi" ? vi : en;
  const value = path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, catalog);
  return typeof value === "string" ? value : path;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

export function t(path: string, vars?: Vars): string {
  return interpolate(lookup(useAuthStore.getState().locale, path), vars);
}

export function localeTag(): string {
  return useAuthStore.getState().locale === "vi" ? "vi-VN" : "en-US";
}

export function useI18n() {
  const locale = useAuthStore((s) => s.locale);
  const setLocale = useAuthStore((s) => s.setLocale);

  return {
    locale,
    setLocale,
    localeTag: locale === "vi" ? "vi-VN" : "en-US",
    t: (path: string, vars?: Vars) => interpolate(lookup(locale, path), vars),
  };
}
