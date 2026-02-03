"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("search");

  // URL -> input (for back/forward and initial hydration)
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const q = value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (q) {
      params.set("q", q);
      params.set("page", "1"); // new search always starts at page 1
    } else {
      params.delete("q");
      params.delete("page");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("placeholder")}
          autoComplete="off"
        />
        <Button type="submit">{t("button")}</Button>
      </form>
    </div>
  );
}
