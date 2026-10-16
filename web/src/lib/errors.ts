"use client";

import { ApiError } from "@/lib/api";
import { t } from "@/i18n/useI18n";

const keys: Record<string, string> = {
  "Invalid email or password": "errors.invalidAuth",
  "Email already registered": "errors.emailTaken",
  "Member is in a party": "errors.memberInParty",
  "Unknown member": "errors.unknownMember",
  Unauthorized: "errors.unauthorized",
  "Not found": "errors.notFound",
  "A member cannot be on both teams": "errors.teamOverlap",
  "Each team needs at least one member": "errors.teamEmpty",
  "Match players must attend the party": "errors.playersMustAttend",
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const key = keys[err.message];
    if (key) return t(key);
  }
  return t("errors.generic");
}
