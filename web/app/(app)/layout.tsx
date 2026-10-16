"use client";

import { ProtectedShell } from "@/components/layout/ProtectedShell";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
