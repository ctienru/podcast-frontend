import type { Show, Episode, PagedResult, RankingsResult } from "@/types/search";

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

// Get API base URL - use localhost for client-side, backend for server-side
function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SEARCH_API_BASE;

  // If running on server-side (Node.js environment)
  if (typeof window === "undefined") {
    // Replace localhost with backend for Docker internal network
    return envUrl?.replace("localhost", "backend") ?? "http://backend:8080/api";
  }

  // Client-side uses the environment variable as-is (localhost)
  return envUrl ?? "http://localhost:8080/api";
}

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
  const apiBaseUrl = getApiBaseUrl();
  const res = await fetch(
    `${apiBaseUrl}/search/shows`,
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
  const apiBaseUrl = getApiBaseUrl();
  const res = await fetch(
    `${apiBaseUrl}/search/episodes`,
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

/* =========================
 * Rankings
 * ========================= */
export async function getRankingsFromApi({
  country = "tw",
  type = "podcast",
  limit = 20,
}: {
  country?: string;
  type?: string;
  limit?: number;
}): Promise<RankingsResult> {
  const apiBaseUrl = getApiBaseUrl();
  const params = new URLSearchParams({
    country,
    type,
    limit: String(limit),
  });

  const res = await fetch(`${apiBaseUrl}/rankings?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SearchApiError(
      `Rankings API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();

  if (!json || typeof json !== "object") {
    throw new SearchApiError("Invalid API response", 500);
  }

  if (json.status === "error") {
    throw new SearchApiError(
      json.error?.message ?? "Rankings API error",
      400
    );
  }

  return json.data ?? { country, type, items: [] };
}