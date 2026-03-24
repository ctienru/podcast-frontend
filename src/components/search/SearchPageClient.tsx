"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { defaultLangForLocale, type SearchMode, type LangFilter } from "@/types/search";
import { AdvancedSearchPanel } from "./advanced/AdvancedSearchPanel";
import { FiltersAppliedBar } from "./advanced/FiltersAppliedBar";

type Props = {
  currentMode: SearchMode;
  currentLang: LangFilter;
  translations: {
    advanced: string;
    advancedTitle: string;
    advancedSubtitle: string;
    matchBehavior: string;
    matchBehaviorHelp: string;
    matchSmart: string;
    matchSmartRecommended: string;
    matchSmartDesc: string;
    matchKeyword: string;
    matchKeywordDesc: string;
    matchExact: string;
    matchExactDesc: string;
    language: string;
    languageHelp: string;
    langZhTw: string;
    langZhCn: string;
    langEn: string;
    langZhBoth: string;
    applyFilters: string;
    reset: string;
    filtersApplied: string;
    editFilters: string;
  };
};

export function SearchPageClient({ currentMode, currentLang, translations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const defaultLang: LangFilter = defaultLangForLocale(locale === "zh" ? "zh" : "en");

  const handleApply = (mode: SearchMode, lang: LangFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (mode === "hybrid") {
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }

    // Omit lang from URL when it matches the locale default — keeps URLs clean
    if (lang === defaultLang) {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }

    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("lang");
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleEdit = () => {
    setIsAdvancedOpen(true);
  };

  return (
    <div className="space-y-4">
      <AdvancedSearchPanel
        isOpen={isAdvancedOpen}
        onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
        currentMode={currentMode}
        currentLang={currentLang}
        defaultLang={defaultLang}
        onApply={handleApply}
        onReset={handleReset}
        translations={translations}
      />

      <FiltersAppliedBar
        mode={currentMode}
        lang={currentLang}
        defaultLang={defaultLang}
        onEdit={handleEdit}
        translations={{
          filtersApplied: translations.filtersApplied,
          editFilters: translations.editFilters,
          matchSmart: translations.matchSmart,
          matchKeyword: translations.matchKeyword,
          matchExact: translations.matchExact,
          langZhTw: translations.langZhTw,
          langZhCn: translations.langZhCn,
          langEn: translations.langEn,
          langZhBoth: translations.langZhBoth,
        }}
      />
    </div>
  );
}
