"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { EpisodeResultCard } from "./EpisodeResultCard";
import { ShowResultCard } from "./ShowResultCard";
import { Pagination } from "./Pagination";
import type { Show, Episode } from "@/types/search";

type Props = {
  shows: Show[];
  episodes: Episode[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
};

export function SearchResultsClient({
  shows,
  episodes,
  total,
  page,
  pageSize,
  query,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("search");

  const onPageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    if (query) params.set("q", query);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* =====================
       * Shows (horizontal scroll)
       * ===================== */}
      {shows.length > 0 && (
        <section aria-labelledby="shows-heading" className="space-y-3">
          <h3
            id="shows-heading"
            className="text-sm font-semibold text-muted-foreground"
          >
            {t("podcasts")}
          </h3>

          <ul
            className="
              flex gap-4 overflow-x-auto pb-2
              -mx-4 px-4
              scroll-smooth
            "
            role="list"
            aria-label={t("podcasts")}
          >
            {shows.map((show) => (
              <li key={show.showId} className="min-w-55 max-w-55 h-40">
                <ShowResultCard show={show} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* =====================
       * Episodes (vertical list)
       * ===================== */}
      <section aria-labelledby="episodes-heading" className="space-y-4">
        <h3
          id="episodes-heading"
          className="text-sm font-semibold text-muted-foreground"
        >
          {t("episodes")}
        </h3>

        <ul className="space-y-6" role="list">
          {episodes.map((episode) => (
            <li key={episode.episodeId}>
              <EpisodeResultCard episode={episode} />
            </li>
          ))}
        </ul>
      </section>

      {/* =====================
       * Pagination
       * ===================== */}
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}