export class SearchApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function searchFromApi({
  query,
  page,
  pageSize,
}: {
  query: string;
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    size: String(pageSize),
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SEARCH_API_BASE}/api/search?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return Promise.reject({
      status: res.status,
      message: `Search API error: ${res.status}`,
    });
  }

  const data = await res.json();

  if (
    typeof data !== "object" ||
    typeof data.total !== "number" ||
    !Array.isArray(data.results)
  ) {
    return Promise.reject({
      status: 500,
      message: "Invalid API response shape",
    });
  }

  return data;
}