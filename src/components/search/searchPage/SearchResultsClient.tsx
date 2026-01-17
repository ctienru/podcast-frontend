"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

  const onPageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    if (query) params.set("q", query);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Shows (only page 1) */}
      {shows.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Podcasts
          </h3>

          <ul className="space-y-3">
            {shows.map((show) => (
              <li key={show.podcastId}>
                <ShowResultCard show={show} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Episodes */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Episodes
        </h3>

        <ul className="space-y-6">
          {episodes.map((episode) => (
            <li key={episode.episodeId}>
              <EpisodeResultCard episode={episode} />
            </li>
          ))}
        </ul>
      </section>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}