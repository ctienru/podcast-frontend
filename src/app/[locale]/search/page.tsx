import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/search/header/SearchBar";
import SearchResultsSection from "@/components/search/searchPage/SearchResultsSection";
import { SearchLoading } from "@/components/search/SearchLoading";
import { SearchLangToggle, type LangFilter } from "@/components/search/SearchLangToggle";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string; lang?: string }>;
};

function getLangFilter(langParam: string | undefined, locale: string): LangFilter {
  if (langParam === "en") return "en";
  if (langParam === "zh") return "zh";
  if (langParam === "hybrid") return "hybrid";
  // Default based on locale
  return locale === "en" ? "en" : "zh";
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

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("search");

  const query = resolvedSearchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1"));
  const hasQuery = query.length > 0;

  const langFilter = getLangFilter(resolvedSearchParams.lang, locale);
  const language = getLanguageArray(langFilter);

  const translations = {
    langEn: t("langEn"),
    langZh: t("langZh"),
    langHybrid: t("langHybrid"),
  };

  return (
    <section className="space-y-6">
      <SearchBar />
      {hasQuery && (
        <>
          <SearchLangToggle currentLang={langFilter} translations={translations} />
          <Suspense fallback={<SearchLoading />}>
            <SearchResultsSection
              key={`${query}:${page}:${langFilter}`}
              query={query}
              page={page}
              language={language}
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