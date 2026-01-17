import { SearchBar } from "@/components/search/SearchBar";
import { SearchSummary } from "@/components/search/SearchSummary";
import { SearchResultsClient } from "@/components/search/SearchResultsClient";

const PAGE_SIZE = 10;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;

  const query = resolvedParams.q ?? "";
  const page = Number(resolvedParams.page ?? "1");

  const total = 124;

  const allResults = Array.from({ length: total }).map((_, i) => ({
    type: i % 2 === 0 ? "podcast" : "episode",
    title: `Result ${i + 1}`,
    author: "Author",
    category: "Technology",
    language: "English",
    imageUrl: "https://via.placeholder.com/64",
    podcast: "Podcast Name",
    duration: "42 min",
    date: "2024-01-01",
    description: "Sample description",
  }));

  const start = (page - 1) * PAGE_SIZE;
  const pagedResults = allResults.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-6">
      <SearchBar />
      <SearchSummary query={query} total={total} />
      <SearchResultsClient
        results={pagedResults}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </section>
  );
}