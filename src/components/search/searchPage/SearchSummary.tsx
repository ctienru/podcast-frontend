import { getTranslations } from "next-intl/server";

type Props = {
  query: string;
  total: number;
};

export async function SearchSummary({ query, total }: Props) {
  const t = await getTranslations("search");

  if (!query) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("resultsAll", { count: total.toLocaleString() })}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {t("results", { query, count: total.toLocaleString() })}
    </p>
  );
}
