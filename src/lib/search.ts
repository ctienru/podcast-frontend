import type { Show, Episode, PagedResult } from "@/types/search";

/* =========================
 * Error
 * ========================= */
export class SearchApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SearchApiError";
    this.status = status;
  }
}

/* =========================
 * Helpers
 * ========================= */
function ensureOkApiResponse<T>(
  json: any,
  fallbackPage: number,
  fallbackSize: number
): PagedResult<T> {
  if (!json || typeof json !== "object") {
    throw new SearchApiError("Invalid API response", 500);
  }

  if (json.status === "error") {
    throw new SearchApiError(
      json.error?.message ?? "Search API error",
      400
    );
  }

  // ok / partial_success 都視為成功
  const data = json.data ?? {};

  return {
    page: data.page ?? fallbackPage,
    pageSize: data.size ?? fallbackSize,
    total: data.total ?? 0,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

/* =========================
 * Shows (discovery, page = 1 only)
 * ========================= */
export async function searchShowsFromApi({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}): Promise<PagedResult<Show>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SEARCH_API_BASE}/search/shows`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        q: query,
        page: 1, // discovery only
        size: pageSize,
      }),
    }
  );

  if (!res.ok) {
    throw new SearchApiError(
      `Show search API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();

  return ensureOkApiResponse<Show>(json, 1, pageSize);
}

/* =========================
 * Episodes
 * ========================= */
export async function searchEpisodesFromApi({
  query,
  page,
  pageSize,
}: {
  query: string;
  page: number;
  pageSize: number;
}): Promise<PagedResult<Episode>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SEARCH_API_BASE}/search/episodes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        q: query,
        page,
        size: pageSize,
      }),
    }
  );

  if (!res.ok) {
    throw new SearchApiError(
      `Episode search API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();

  return ensureOkApiResponse<Episode>(json, page, pageSize);
}