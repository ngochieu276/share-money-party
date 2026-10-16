"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoading } from "@/components/layout/PageLoading";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return <PageLoading />;
  return <AppLayout>{children}</AppLayout>;
}
