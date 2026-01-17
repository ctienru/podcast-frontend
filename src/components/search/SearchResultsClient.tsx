"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchResultList } from "./SearchResultList";
import { Pagination } from "./Pagination";

type Props = {
  results: any[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
};

export function SearchResultsClient({
  results,
  total,
  page,
  pageSize,
  query,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onPageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(nextPage));
    if (query) {
      params.set("q", query);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <SearchResultList results={results} />

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </>
  );
}