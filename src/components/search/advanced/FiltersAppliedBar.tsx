"use client";

import { SearchMode, LangFilter } from "@/types/search";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type Props = {
  mode: SearchMode;
  lang: LangFilter;
  onEdit: () => void;
  translations: {
    filtersApplied: string;
    editFilters: string;
    matchSmart: string;
    matchKeyword: string;
    matchExact: string;
    langAny: string;
    langZhOnly: string;
    langEnOnly: string;
  };
};

export function FiltersAppliedBar({ mode, lang, onEdit, translations }: Props) {
  // Hide when using default filters
  if (mode === "hybrid" && lang === "hybrid") {
    return null;
  }

  const modeLabel =
    mode === "hybrid"
      ? translations.matchSmart
      : mode === "bm25"
      ? translations.matchKeyword
      : translations.matchExact;

  const langLabel =
    lang === "hybrid"
      ? translations.langAny
      : lang === "zh"
      ? translations.langZhOnly
      : translations.langEnOnly;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{translations.filtersApplied}</span>
        <span className="font-medium">
          {modeLabel} · {langLabel}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="gap-1"
      >
        {translations.editFilters}
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
