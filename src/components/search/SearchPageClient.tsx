"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchMode, LangFilter } from "@/types/search";
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
    langAny: string;
    langZhOnly: string;
    langEnOnly: string;
    applyFilters: string;
    reset: string;
    filtersApplied: string;
    editFilters: string;
  };
};

export function SearchPageClient({ currentMode, currentLang, translations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleApply = (mode: SearchMode, lang: LangFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    // Set mode parameter (or remove if default)
    if (mode === "hybrid") {
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }

    // Set lang parameter (or remove if default)
    if (lang === "hybrid") {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }

    // Reset to page 1 when changing filters
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
        onApply={handleApply}
        onReset={handleReset}
        translations={translations}
      />

      <FiltersAppliedBar
        mode={currentMode}
        lang={currentLang}
        onEdit={handleEdit}
        translations={{
          filtersApplied: translations.filtersApplied,
          editFilters: translations.editFilters,
          matchSmart: translations.matchSmart,
          matchKeyword: translations.matchKeyword,
          matchExact: translations.matchExact,
          langAny: translations.langAny,
          langZhOnly: translations.langZhOnly,
          langEnOnly: translations.langEnOnly,
        }}
      />
    </div>
  );
}
