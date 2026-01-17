import { Suspense } from "react";
import { SearchBar } from "@/components/search/header/SearchBar";
import SearchResultsSection from "@/components/search/searchPage/SearchResultsSection";
import { SearchLoading } from "@/components/search/SearchLoading";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;

  const query = resolvedSearchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1"));
  const hasQuery = query.length > 0;

  return (
    <section className="space-y-6">
      <SearchBar />
      {hasQuery && (
        <Suspense fallback={<SearchLoading />}>
          <SearchResultsSection
            key={`${query}:${page}`}
            query={query}
            page={page}
          />
        </Suspense>
      )}
    </section>
  );
}

/* =========================
 * Metadata
 * ========================= */
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
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