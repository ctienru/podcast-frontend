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
  const params = useSearchParams();

  const handlePageChange = (nextPage: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("page", String(nextPage));
    if (query) newParams.set("q", query);

    router.push(`?${newParams.toString()}`);
  };

  return (
    <>
      <SearchResultList results={results} />

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </>
  );
}