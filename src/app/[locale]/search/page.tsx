import { Suspense } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import SearchResultsSection from "@/components/search/SearchResultsSection";
import { SearchLoading } from "@/components/search/SearchLoading";
import { SearchSummary } from "@/components/search/SearchSummary";
import type { Metadata } from "next";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));

  return (
    <section className="space-y-6">
      <SearchBar />

      {/* loading summary (shown immediately) */}
      <SearchSummary query={query} />

      {/* skeleton + streaming */}
      <Suspense fallback={<SearchLoading />}>
        <SearchResultsSection
          key={`${query}:${page}`}
          query={query}
          page={page}
        />
      </Suspense>
    </section>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const locale = resolvedParams.locale;
  const query = resolvedSearchParams.q?.trim();
  const page = resolvedSearchParams.page;

  const siteName = "Podcast Search";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const title = query
    ? `${query} – ${siteName}`
    : siteName;

  const description = query
    ? `Search results for "${query}" on ${siteName}.`
    : `Search podcasts and episodes on ${siteName}.`;

  // canonical NEVER includes page
  const canonicalUrl = query
    ? `${baseUrl}/${locale}/search?q=${encodeURIComponent(query)}`
    : `${baseUrl}/${locale}/search`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index:
        !!query &&
        query.length >= 3 &&
        (!page || page === "1"),
      follow: true,
    },
  };
}