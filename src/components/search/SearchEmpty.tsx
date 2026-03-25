"use client";

import { useTranslations } from "next-intl";

type Props = {
  query: string;
  hasShows?: boolean;
  reason?: "empty" | "too_short";
};

const MIN_QUERY_LENGTH = 2;

export function SearchEmpty({ query, hasShows, reason }: Props) {
  const t = useTranslations("search");

  // keyword too short
  if (reason === "too_short") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-medium text-amber-800">{t("tooShortTitle")}</p>
        <p className="text-sm text-amber-700">
          {t("tooShortDescription", { min: MIN_QUERY_LENGTH })}
        </p>
      </div>
    );
  }

  // with shows but no episodes
  if (hasShows) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="font-medium">{t("noEpisodesTitle")}</p>
        <p className="text-sm text-muted-foreground">
          {t("noEpisodesDescription", { query })}
        </p>
      </div>
    );
  }

  // no shows and no episodes
  return (
    <div className="rounded-md border p-6 text-center">
      <p className="font-medium">{t("noResultsTitle")}</p>
      <p className="text-sm text-muted-foreground">
        {query ? t("noResultsWithQuery", { query }) : t("noResultsEmpty")}
      </p>
    </div>
  );
}
