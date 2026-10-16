"use client";

export function ListPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
