import type { LangFilter } from "@/types/search";

/**
 * Click log payload sent by the frontend via navigator.sendBeacon.
 * Field names are camelCase to match the podcast-spec API contract.
 */
export type ClickLogPayload = {
  requestId: string;
  timestamp: string;        // ISO 8601 UTC
  query: string;
  selectedLang: LangFilter;
  clickedEpisodeId: string;
  clickedRank: number;      // 1-indexed
  clickedLanguage: string;  // language field of the clicked episode document
  timeToClickSec: number;   // seconds from search result display to click
};
