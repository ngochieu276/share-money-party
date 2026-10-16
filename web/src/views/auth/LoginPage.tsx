"use client";

import { GuestShell } from "@/components/layout/GuestShell";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { AuthResponse } from "@/lib/types";
import { useI18n } from "@/i18n/useI18n";
import { APP_HOME, useAuthStore } from "@/stores/auth";
import { Glasses } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <GuestShell>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl">
            <Glasses className="size-5 text-progress" />
            {t("brand.name")}
          </Link>
          <LanguageToggle />
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
          <h1 className="font-serif text-3xl">{t("auth.loginTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.loginBody")}</p>
          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              try {
                const data = await api<AuthResponse>("/auth/login", {
                  method: "POST",
                  body: JSON.stringify({ email, password }),
                });
                setToken(data.token);
                router.replace(APP_HOME);
              } catch (err) {
                toast.error(errorMessage(err));
              } finally {
                setPending(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button className="w-full" disabled={pending}>
              {t("auth.login")}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              {t("auth.toRegister")}
            </Link>
          </p>
        </main>
      </div>
    </GuestShell>
  );
}
