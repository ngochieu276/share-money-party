"use client";

import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";
import { APP_HOME, useAuthStore } from "@/stores/auth";
import { Glasses } from "lucide-react";
import Link from "next/link";

export function LandingPage() {
  const { t } = useI18n();
  const token = useAuthStore((s) => s.token);
  const appHref = token ? APP_HOME : "/register";

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl">
          <Glasses className="size-5 text-progress" />
          {t("brand.name")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">{t("landing.login")}</Link>
          </Button>
          <Button asChild>
            <Link href={appHref}>{t("landing.cta")}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-progress">
              {t("landing.kicker")}
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {t("landing.title")}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              {t("landing.body")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href={appHref}>{t("landing.cta")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">{t("landing.login")}</Link>
              </Button>
            </div>
          </div>
          <ReceiptPreview />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Feature
            title={t("landing.featureMembersTitle")}
            body={t("landing.featureMembersBody")}
          />
          <Feature
            title={t("landing.featureBetsTitle")}
            body={t("landing.featureBetsBody")}
          />
          <Feature
            title={t("landing.featureSplitTitle")}
            body={t("landing.featureSplitBody")}
          />
        </section>
      </main>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function ReceiptPreview() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="font-serif text-lg">S0 1,000,000</p>
      <p className="mt-1 text-sm text-muted-foreground">S1 80,000 · A0 230,000</p>
      <div className="mt-5 space-y-2 text-sm">
        <Row name="A" loss="0" total="230,000" />
        <Row name="B" loss="0" total="230,000" />
        <Row name="C" loss="40,000" total="270,000" lossy />
        <Row name="D" loss="40,000" total="270,000" lossy />
      </div>
    </div>
  );
}

function Row({
  name,
  loss,
  total,
  lossy,
}: {
  name: string;
  loss: string;
  total: string;
  lossy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
      <span>{name}</span>
      <span className={lossy ? "text-miss" : "text-hit"}>+{loss}</span>
      <span className="font-medium">{total}</span>
    </div>
  );
}
