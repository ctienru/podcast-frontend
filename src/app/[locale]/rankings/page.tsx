import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRankingsFromApi } from "@/lib/search";
import { RankingsClient } from "./RankingsClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string; type?: string }>;
};

export default async function RankingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { country = "tw", type = "podcast" } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("rankings");

  let rankings = null;
  let error = null;

  try {
    rankings = await getRankingsFromApi({
      country,
      type,
      limit: 20,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load rankings";
  }

  return (
    <section className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <RankingsClient
        initialRankings={rankings}
        initialCountry={country}
        initialType={type}
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
