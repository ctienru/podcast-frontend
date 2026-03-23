import { SearchResultsClient } from "@/components/search/searchPage/SearchResultsClient";
import { SearchSummary } from "@/components/search/searchPage/SearchSummary";
import { SearchEmpty } from "@/components/search/SearchEmpty";
import { SearchError } from "@/components/search/SearchError";
import { ShowsBanner } from "@/components/search/searchPage/ShowsBanner";
import { searchEpisodesFromApi, searchShowsFromApi } from "@/lib/search";
import { buildSearchItemListSchema } from "@/lib/schema";
import type { Episode, Show, SearchMode, LangFilter } from "@/types/search";

const EPISODE_PAGE_SIZE = 10;
const SHOWS_PAGE_SIZE = 10;
const MIN_QUERY_LENGTH = 2;

type Props = {
  query: string;
  page: number;
  lang: LangFilter;
  mode?: SearchMode;
};

export default async function SearchResultsSection({
  query,
  page,
  lang,
  mode,
}: Props) {
  let episodeResults: Episode[] = [];
  let episodeTotal = 0;
  let showResults: Show[] = [];
  let error: string | null = null;
  let schema: object | null = null;
  let searchRequestId: string | null = null;
  let degradedWarning: string | null = null;

  try {
    // Fetch episodes
    const { result: episodes, searchRequestId: reqId, warning } = await searchEpisodesFromApi({
      query,
      page,
      pageSize: EPISODE_PAGE_SIZE,
      lang,
      mode,
    });

    episodeResults = episodes.items;
    episodeTotal = episodes.total;
    searchRequestId = reqId || null;
    degradedWarning = warning;

    // Fetch shows only on first page, always use hybrid mode
    if (page === 1) {
      try {
        const shows = await searchShowsFromApi({
          query,
          pageSize: SHOWS_PAGE_SIZE,
          mode: "hybrid", // Always use hybrid for shows
        });

        showResults = shows.items;
      } catch (showErr) {
        // If show search fails, just log it and continue
        console.error("Show search failed:", showErr);
      }
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    if (episodeResults.length > 0) {
      schema = buildSearchItemListSchema({
        url: `${baseUrl}/search?q=${encodeURIComponent(query)}`,
        results: episodeResults,
      });
    }
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      err.status === 429
    ) {
      error = "Too many requests. Please try again in a moment.";
    } else {
      console.error("Search API error:", err);
      error = "Failed to load search results.";
    }
  }

  const isQueryTooShort = query.trim().length < MIN_QUERY_LENGTH;
  const hasEpisodes = episodeResults.length > 0;
  const hasShows = showResults.length > 0;

  return (
    <>
      <SearchSummary query={query} total={episodeTotal} />

      {error ? (
        <SearchError message={error} />
      ) : isQueryTooShort ? (
        <SearchEmpty query={query} reason="too_short" />
      ) : !hasEpisodes && !hasShows ? (
        <SearchEmpty query={query} />
      ) : (
        <>
          {schema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
              }}
            />
          )}

          {/* Show banner only on first page */}
          {page === 1 && hasShows && (
            <ShowsBanner shows={showResults} />
          )}

          {degradedWarning && (
            <p role="status" className="text-sm text-muted-foreground px-1 pb-2">
              ℹ️ Showing text-match results. Semantic search is temporarily unavailable.
            </p>
          )}

          {hasEpisodes && (
            <SearchResultsClient
              episodes={episodeResults}
              total={episodeTotal}
              page={page}
              pageSize={EPISODE_PAGE_SIZE}
              query={query}
              searchRequestId={searchRequestId}
              selectedLang={lang}
            />
          )}
        </>
      )}
    </>
  );
}
