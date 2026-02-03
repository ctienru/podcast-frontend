import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRankingsFromApi } from "@/lib/search";
import { RankingsClient } from "./RankingsClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string; type?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { type = "podcast" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "rankings" });

  // Dynamic title based on type
  const title = type === "episode" ? t("titleEpisode") : t("titlePodcast");
  const description = type === "episode" ? t("descriptionEpisode") : t("descriptionPodcast");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}/rankings`,
      languages: {
        en: "/en/rankings",
        zh: "/zh/rankings",
      },
    },
  };
}

export default async function RankingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { country, type = "podcast" } = await searchParams;
  const defaultCountry = locale === "zh" ? "tw" : "us";
  const resolvedCountry = country ?? defaultCountry;
  setRequestLocale(locale);

  const t = await getTranslations("rankings");

  let rankings = null;
  let error = null;

  try {
    rankings = await getRankingsFromApi({
      country: resolvedCountry,
      type,
      limit: 100,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load rankings";
  }

  const jsonLd = rankings?.items?.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: locale === "zh" ? "Podcast 排行榜" : "Podcast Rankings",
        itemListElement: rankings.items.slice(0, 10).map((item, i) => ({
          "@type": "ListItem",
          position: item.rank ?? i + 1,
          item: {
            "@type": "PodcastSeries",
            name: item.title,
            author: { "@type": "Person", name: item.publisher },
          },
        })),
      }
    : null;

  return (
    <section className="space-y-6">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <RankingsClient
        initialRankings={rankings}
        initialCountry={resolvedCountry}
        initialType={type}
        locale={locale}
        error={error}
        translations={{
          selectCountry: t("selectCountry"),
          taiwan: t("taiwan"),
          unitedStates: t("unitedStates"),
          podcast: t("podcast"),
          episode: t("episode"),
          noResults: t("noResults"),
          episodes: t("episodes"),
          updatedAt: t("updatedAt"),
        }}
      />
    </section>
  );
}
