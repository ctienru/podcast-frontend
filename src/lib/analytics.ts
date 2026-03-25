import type { ClickLogPayload } from "@/types/analytics";
import type { LangFilter, EpisodeLanguage } from "@/types/search";

type BuildClickLogPayloadInput = {
  requestId: string;
  query: string;
  selectedLang: LangFilter;
  episode: { episodeId: string; language: EpisodeLanguage };
  rank: number;
  searchResultTimestamp: number;  // Date.now() when search results arrived
  clickTimestamp: number;         // Date.now() at click
};

export function buildClickLogPayload(
  input: BuildClickLogPayloadInput
): ClickLogPayload {
  return {
    requestId: input.requestId,
    timestamp: new Date(input.clickTimestamp).toISOString(),
    query: input.query,
    selectedLang: input.selectedLang,
    clickedEpisodeId: input.episode.episodeId,
    clickedRank: input.rank,
    clickedLanguage: input.episode.language,
    timeToClickSec: Math.max(
      0,
      Math.floor(
        (input.clickTimestamp - input.searchResultTimestamp) / 1000
      )
    ),
  };
}
