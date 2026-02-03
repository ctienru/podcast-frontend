"use client";

import { useState, useRef } from "react";
import { SearchMode, LangFilter } from "@/types/search";
import { MatchBehaviorSection } from "./MatchBehaviorSection";
import { LanguageFilterSection } from "./LanguageFilterSection";
import { ActionButtons } from "./ActionButtons";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: SearchMode;
  currentLang: LangFilter;
  onApply: (mode: SearchMode, lang: LangFilter) => void;
  onReset: () => void;
  translations: {
    advanced: string;
    advancedTitle: string;
    advancedSubtitle: string;
    matchBehavior: string;
    matchBehaviorHelp: string;
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
  };
};

export function AdvancedSearchPanel({
  isOpen,
  onToggle,
  currentMode,
  currentLang,
  onApply,
  onReset,
  translations,
}: Props) {
  // Track previous props to detect changes
  const prevPropsRef = useRef({ currentMode, currentLang });

  // Internal state for draft values - reset when props change
  const [draftMode, setDraftMode] = useState<SearchMode>(currentMode);
  const [draftLang, setDraftLang] = useState<LangFilter>(currentLang);

  // Check if props changed and reset draft values during render
  if (
    prevPropsRef.current.currentMode !== currentMode ||
    prevPropsRef.current.currentLang !== currentLang
  ) {
    prevPropsRef.current = { currentMode, currentLang };
    // Reset draft values to match new props
    if (draftMode !== currentMode) setDraftMode(currentMode);
    if (draftLang !== currentLang) setDraftLang(currentLang);
  }

  const handleApply = () => {
    onApply(draftMode, draftLang);
    onToggle(); // Close panel after applying
  };

  const handleReset = () => {
    setDraftMode("hybrid");
    setDraftLang("hybrid");
    onReset();
    onToggle(); // Close panel after reset
  };

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggle}
        className="gap-2"
      >
        {translations.advanced}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Panel Content */}
      {isOpen && (
        <div className="space-y-6 rounded-lg border bg-card p-6">
          <div>
            <h2 className="text-lg font-semibold">{translations.advancedTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {translations.advancedSubtitle}
            </p>
          </div>

          <MatchBehaviorSection
            value={draftMode}
            onChange={setDraftMode}
            translations={{
              matchBehavior: translations.matchBehavior,
              matchBehaviorHelp: translations.matchBehaviorHelp,
              matchSmartRecommended: translations.matchSmartRecommended,
              matchSmartDesc: translations.matchSmartDesc,
              matchKeyword: translations.matchKeyword,
              matchKeywordDesc: translations.matchKeywordDesc,
              matchExact: translations.matchExact,
              matchExactDesc: translations.matchExactDesc,
            }}
          />

          <LanguageFilterSection
            value={draftLang}
            onChange={setDraftLang}
            translations={{
              language: translations.language,
              languageHelp: translations.languageHelp,
              langAny: translations.langAny,
              langZhOnly: translations.langZhOnly,
              langEnOnly: translations.langEnOnly,
            }}
          />

          <ActionButtons
            onApply={handleApply}
            onReset={handleReset}
            translations={{
              applyFilters: translations.applyFilters,
              reset: translations.reset,
            }}
          />
        </div>
      )}
    </div>
  );
}
