import { SearchResultsClient } from "@/components/search/searchPage/SearchResultsClient";
import { SearchSummary } from "@/components/search/searchPage/SearchSummary";
import { SearchEmpty } from "@/components/search/SearchEmpty";
import { SearchError } from "@/components/search/SearchError";
import {
  searchShowsFromApi,
  searchEpisodesFromApi,
} from "@/lib/search";
import { buildSearchItemListSchema } from "@/lib/schema";
import type { Show, Episode, PagedResult } from "@/types/search";

const SHOW_PAGE_SIZE = 5;
const EPISODE_PAGE_SIZE = 10;
const MIN_QUERY_LENGTH = 2;

type Props = {
  query: string;
  page: number;
};

export default async function SearchResultsSection({
  query,
  page,
}: Props) {
  let showResults: Show[] = [];
  let episodeResults: Episode[] = [];
  let episodeTotal = 0;
  let error: string | null = null;
  let schema: object | null = null;

  try {
    const [shows, episodes]: [
      PagedResult<Show>,
      PagedResult<Episode>
    ] = await Promise.all([
      searchShowsFromApi({
        query,
        pageSize: SHOW_PAGE_SIZE,
      }),
      searchEpisodesFromApi({
        query,
        page,
        pageSize: EPISODE_PAGE_SIZE,
      }),
    ]);

    showResults = shows.items;
    episodeResults = episodes.items;
    episodeTotal = episodes.total;

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

  // determine what to render
  const isQueryTooShort = query.trim().length < MIN_QUERY_LENGTH;
  const hasShows = showResults.length > 0;
  const hasEpisodes = episodeResults.length > 0;

  return (
    <>
      <SearchSummary query={query} total={episodeTotal} />

      {error ? (
        <SearchError message={error} />
      ) : isQueryTooShort ? (
        <SearchEmpty query={query} reason="too_short" />
      ) : !hasEpisodes ? (
        <SearchEmpty query={query} hasShows={hasShows} />
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

          <SearchResultsClient
            shows={showResults}
            episodes={episodeResults}
            total={episodeTotal}
            page={page}
            pageSize={EPISODE_PAGE_SIZE}
            query={query}
          />
        </>
      )}
    </>
  );
}