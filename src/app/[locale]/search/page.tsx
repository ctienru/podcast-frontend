import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/search/header/SearchBar";
import SearchResultsSection from "@/components/search/searchPage/SearchResultsSection";
import { SearchLoading } from "@/components/search/SearchLoading";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import type { SearchMode, LangFilter } from "@/types/search";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string; lang?: string; mode?: string }>;
};

function getLangFilter(langParam: string | undefined): LangFilter {
  if (langParam === "en") return "en";
  if (langParam === "zh") return "zh";
  if (langParam === "hybrid") return "hybrid";
  // Default to hybrid (any language)
  return "hybrid";
}

function getLanguageArray(langFilter: LangFilter): string[] {
  switch (langFilter) {
    case "en":
      return ["en"];
    case "zh":
      return ["zh-hant"];
    case "hybrid":
      return ["en", "zh-hant"];
  }
}

function getSearchMode(modeParam: string | undefined): SearchMode {
  if (modeParam === "bm25") return "bm25";
  if (modeParam === "knn") return "knn";
  if (modeParam === "exact") return "exact";
  // Default to hybrid (smart search)
  return "hybrid";
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("search");

  const query = resolvedSearchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1"));
  const hasQuery = query.length > 0;

  const langFilter = getLangFilter(resolvedSearchParams.lang);
  const language = getLanguageArray(langFilter);
  const searchMode = getSearchMode(resolvedSearchParams.mode);

  const advancedTranslations = {
    advanced: t("advanced"),
    advancedTitle: t("advancedTitle"),
    advancedSubtitle: t("advancedSubtitle"),
    matchBehavior: t("matchBehavior"),
    matchBehaviorHelp: t("matchBehaviorHelp"),
    matchSmart: t("matchSmart"),
    matchSmartRecommended: t("matchSmartRecommended"),
    matchSmartDesc: t("matchSmartDesc"),
    matchKeyword: t("matchKeyword"),
    matchKeywordDesc: t("matchKeywordDesc"),
    matchExact: t("matchExact"),
    matchExactDesc: t("matchExactDesc"),
    language: t("language"),
    languageHelp: t("languageHelp"),
    langAny: t("langAny"),
    langZhOnly: t("langZhOnly"),
    langEnOnly: t("langEnOnly"),
    applyFilters: t("applyFilters"),
    reset: t("reset"),
    filtersApplied: t("filtersApplied"),
    editFilters: t("editFilters"),
  };

  return (
    <section className="space-y-6">
      <SearchBar />
      {hasQuery && (
        <>
          <SearchPageClient
            currentMode={searchMode}
            currentLang={langFilter}
            translations={advancedTranslations}
          />
          <Suspense fallback={<SearchLoading />}>
            <SearchResultsSection
              key={`${query}:${page}:${langFilter}:${searchMode}`}
              query={query}
              page={page}
              language={language}
              mode={searchMode}
            />
          </Suspense>
        </>
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

  const siteT = await getTranslations({ locale, namespace: "site" });
  const siteName = siteT("title");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const title = query ? query : null;

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
        query.length >= 2 &&
        (!page || page === "1"),
      follow: true,
    },
  };
}