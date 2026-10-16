"use client";

import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n/useI18n";
import { APP_HOME, useAuthStore } from "@/stores/auth";
import { Glasses, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [open, setOpen] = useState(false);

  const links = [
    { href: APP_HOME, label: t("nav.parties") },
    { href: "/members", label: t("nav.members") },
  ];

  function logout() {
    setToken(null);
    router.replace("/login");
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-accent",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-card/70 md:flex md:flex-col">
        <Link
          href={APP_HOME}
          className="flex items-center gap-2 px-5 py-6 font-serif text-xl"
        >
          <Glasses className="size-5 text-progress" />
          {t("brand.name")}
        </Link>
        <div className="flex-1 px-3">{nav}</div>
        <div className="space-y-3 p-4">
          <LanguageToggle className="w-full" />
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            {t("nav.logout")}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card/80 px-4 py-3 md:hidden">
          <Link href={APP_HOME} className="flex items-center gap-2 font-serif text-lg">
            <Glasses className="size-4 text-progress" />
            {t("brand.name")}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </header>
        {open ? (
          <div className="border-b bg-card p-4 md:hidden">
            {nav}
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <LanguageToggle />
              <Button variant="ghost" onClick={logout}>
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        ) : null}
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
