"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { EpisodeResultCard } from "./EpisodeResultCard";
import { Pagination } from "./Pagination";
import type { Episode, LangFilter } from "@/types/search";

type Props = {
  episodes: Episode[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  // Phase 3 click log props — passed to EpisodeResultCard in Step 7
  searchRequestId: string | null;
  selectedLang: LangFilter;
};

export function SearchResultsClient({
  episodes,
  total,
  page,
  pageSize,
  query,
  searchRequestId,
  selectedLang,
}: Props) {
  const [searchResultTimestamp, setSearchResultTimestamp] = useState<number | null>(null);
  useEffect(() => {
    setSearchResultTimestamp(Date.now());
  }, [searchRequestId]);

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
    <div className="space-y-6">
      {/* Episodes */}
      <ul className="space-y-6" role="list">
        {episodes.map((episode, index) => (
          <li key={episode.episodeId}>
            <EpisodeResultCard
              episode={episode}
              rank={index + 1}
              searchRequestId={searchRequestId}
              searchResultTimestamp={searchResultTimestamp}
              query={query}
              selectedLang={selectedLang}
            />
          </li>
        ))}
      </ul>

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