"use client";

import { useState, useEffect, useRef } from "react";
import { SearchMode, LangFilter } from "@/types/search";
import { MatchBehaviorSection } from "./MatchBehaviorSection";
import { LanguageFilterSection } from "./LanguageFilterSection";
import { ActionButtons } from "./ActionButtons";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Check if a click target is inside a select portal (Radix UI dropdown, slot-based select, or listbox).
 * Used by AdvancedSearchPanel to detect clicks outside the panel and its associated dropdowns.
 */
const isEventInsideSelectPortal = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest("[data-radix-popper-content-wrapper]") ||
    target.closest("[data-slot='select-content']") ||
    target.closest("[role='listbox']")
  );
};

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: SearchMode;
  currentLang: LangFilter;
  defaultLang: LangFilter;
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
    langZhTw: string;
    langZhCn: string;
    langEn: string;
    langZhBoth: string;
    applyFilters: string;
    reset: string;
  };
};

export function AdvancedSearchPanel({
  isOpen,
  onToggle,
  currentMode,
  currentLang,
  defaultLang,
  onApply,
  onReset,
  translations,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Internal state for draft values.
  const [draftMode, setDraftMode] = useState<SearchMode>(currentMode);
  const [draftLang, setDraftLang] = useState<LangFilter>(currentLang);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsidePanel =
        panelRef.current && panelRef.current.contains(event.target as Node);
      const clickedInsideSelectPortal = isEventInsideSelectPortal(event.target);

      if (!clickedInsidePanel && !clickedInsideSelectPortal) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const handleToggle = () => {
    if (!isOpen) {
      setDraftMode(currentMode);
      setDraftLang(currentLang);
    }
    onToggle();
  };

  const handleApply = () => {
    onApply(draftMode, draftLang);
    onToggle(); // Close panel after applying
  };

  const handleReset = () => {
    setDraftMode("hybrid");
    setDraftLang(defaultLang);
    onReset();
    onToggle(); // Close panel after reset
  };

  return (
    <div ref={panelRef} className="space-y-4">
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={handleToggle}
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
              langZhTw: translations.langZhTw,
              langZhCn: translations.langZhCn,
              langEn: translations.langEn,
              langZhBoth: translations.langZhBoth,
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
