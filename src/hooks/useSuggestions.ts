"use client";

import { useState, useEffect, useRef } from "react";
import { getSuggestions, type SuggestResult } from "@/lib/search";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

export function useSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SuggestResult>({
    shows: [],
    episodes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    abortControllerRef.current?.abort();

    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions({ shows: [], episodes: [] });
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const result = await getSuggestions({ query });
        if (!controller.signal.aborted) {
          setSuggestions(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Suggestion fetch failed:", error);
          setSuggestions({ shows: [], episodes: [] });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const hasResults = suggestions.shows.length > 0 || suggestions.episodes.length > 0;

  return { suggestions, isLoading, hasResults };
}
