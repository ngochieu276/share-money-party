"use client";

import { PageLoading } from "@/components/layout/PageLoading";
import { useHydrated } from "@/hooks/useHydrated";
import { APP_HOME, useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function GuestShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && token) router.replace(APP_HOME);
  }, [hydrated, token, router]);

  if (!hydrated) return <PageLoading />;
  if (token) return <PageLoading />;
  return <>{children}</>;
}
