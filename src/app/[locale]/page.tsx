"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const tSearch = useTranslations("search");

  const [query, setQuery] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
  };

  return (
    <>
      {/* Hero */}
      <section className="py-16 text-center space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("heroTitle")}
        </h1>
        <p className="text-muted-foreground">{t("heroDescription")}</p>

        <form onSubmit={onSubmit} className="mx-auto max-w-md flex gap-2">
          <Input
            placeholder={tSearch("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit">{tSearch("button")}</Button>
        </form>
      </section>

      {/* Highlights */}
      <section className="py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/rankings" className="block">
            <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4 space-y-1">
                <h2 className="font-semibold">{t("rankingsTitle")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("rankingsDescription")}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="p-4 space-y-1">
              <h2 className="font-semibold">{t("episodeSearchTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("episodeSearchDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}