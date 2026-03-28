"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

    </>
  );
}