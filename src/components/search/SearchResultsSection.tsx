import { SearchResultsClient } from "@/components/search/SearchResultsClient";
import { SearchSummary } from "@/components/search/SearchSummary";
import { SearchEmpty } from "@/components/search/SearchEmpty";
import { SearchError } from "@/components/search/SearchError";
import { searchFromApi } from "@/lib/search";
import { buildSearchItemListSchema } from "@/lib/schema";

const PAGE_SIZE = 10;

export default async function SearchResultsSection({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  let total = 0;
  let results: any[] = [];
  let error: string | null = null;
  let schema: any = null;

  try {
    const data = await searchFromApi({
      query,
      page,
      pageSize: PAGE_SIZE,
    });

    total = data.total;
    results = data.results;

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    if (results.length > 0) {
      schema = buildSearchItemListSchema({
        url: `${baseUrl}/search?q=${encodeURIComponent(query)}`,
        results,
      });
    }
  } catch (err: any) {
    if (err?.status === 404) {
      total = 0;
      results = [];
    } else if (err?.status === 429) {
      error = "Too many requests. Please try again in a moment.";
    } else {
      console.error("Search API error:", err);
      error = "Failed to load search results.";
    }
  }

  return (
    <>
      <SearchSummary query={query} total={total} />

      {error ? (
        <SearchError message={error} />
      ) : results.length === 0 ? (
        <SearchEmpty query={query} />
      ) : (
        <>
          {/* JSON-LD injected as part of page content */}
          {schema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
              }}
            />
          )}

          <SearchResultsClient
            results={results}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            query={query}
          />
        </>
      )}
    </>
  );
}