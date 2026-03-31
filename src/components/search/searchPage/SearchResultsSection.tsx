import { SearchResultsClient } from "@/components/search/searchPage/SearchResultsClient";
import { SearchSummary } from "@/components/search/searchPage/SearchSummary";
import { SearchEmpty } from "@/components/search/SearchEmpty";
import { SearchError } from "@/components/search/SearchError";
import { ShowsBanner } from "@/components/search/searchPage/ShowsBanner";
import { SearchWarningBanner } from "@/components/search/searchPage/SearchWarningBanner";
import { searchEpisodesFromApi, searchShowsFromApi } from "@/lib/search";
import { getLanguageArray } from "@/app/[locale]/search/utils";
import { buildSearchItemListSchema } from "@/lib/schema";
import { getRequestOriginFromCurrentRequest } from "@/lib/request-origin";
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
  const requestOrigin = await getRequestOriginFromCurrentRequest();
  let episodeResults: Episode[] = [];
  let episodeTotal = 0;
  let showResults: Show[] = [];
  let error: string | null = null;
  let schema: object | null = null;
  let searchRequestId: string | null = null;
  const warnings: string[] = [];

  try {
    // Fetch episodes
    const { result: episodes, searchRequestId: reqId, warning } = await searchEpisodesFromApi({
      query,
      page,
      pageSize: EPISODE_PAGE_SIZE,
      lang,
      mode,
      baseUrl: requestOrigin,
    });

    episodeResults = episodes.items;
    episodeTotal = episodes.total;
    searchRequestId = reqId || null;

    if (warning) {
      warnings.push(warning);
    }

    // Fetch shows only on first page, always use hybrid mode
    if (page === 1) {
      try {
        const { result: shows, warning: showWarning } = await searchShowsFromApi({
          query,
          pageSize: SHOWS_PAGE_SIZE,
          language: getLanguageArray(lang),
          mode: "hybrid", // Always use hybrid for shows
          baseUrl: requestOrigin,
        });

        showResults = shows.items;
        if (showWarning) {
          warnings.push(showWarning);
        }
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
          <SearchWarningBanner warnings={warnings} />

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
