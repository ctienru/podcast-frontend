"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSuggestions } from "@/hooks/useSuggestions";
import { SuggestionDropdown, type FlatSuggestion } from "./SuggestionDropdown";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("search");

  // URL -> input (for back/forward and initial hydration)
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, isLoading, hasResults } = useSuggestions(value);

  // Flatten suggestions for keyboard navigation
  const flatSuggestions: FlatSuggestion[] = [
    ...suggestions.shows.map((s) => ({ type: "show" as const, ...s })),
    ...suggestions.episodes.map((e) => ({ type: "episode" as const, ...e })),
  ];

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  // Open dropdown when typing and has results
  useEffect(() => {
    if (value.length >= 2 && hasResults) {
      setIsOpen(true);
    }
  }, [value, hasResults]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (suggestion: FlatSuggestion) => {
      if (suggestion.type === "show") {
        router.push(`/show/${suggestion.showId}`);
      } else {
        // For episodes, search with the episode title
        setValue(suggestion.title);
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", suggestion.title);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
      }
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [router, searchParams]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || flatSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatSuggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSelect(flatSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setSelectedIndex(-1);

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
    <div ref={containerRef} className="relative">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => hasResults && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="suggestion-listbox"
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
        />
        <Button type="submit">{t("button")}</Button>
      </form>

      {isOpen && (
        <SuggestionDropdown
          shows={suggestions.shows}
          episodes={suggestions.episodes}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
