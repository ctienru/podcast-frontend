import type { Show, Episode, PagedResult, RankingsResult, SearchMode, ShowDetail, LangFilter } from "@/types/search";

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
 * Types
 * ========================= */
interface ApiResponse<T> {
  status: "ok" | "partial_success" | "error";
  warning?: string;
  data?: {
    page?: number;
    size?: number;
    total?: number;
    items?: T[];
  };
  error?: {
    message?: string;
  };
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
  json: ApiResponse<T>,
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
export type ShowSearchMode = "bm25" | "knn" | "hybrid";

export async function searchShowsFromApi({
  query,
  pageSize,
  language,
  mode,
}: {
  query: string;
  pageSize: number;
  language?: string[];
  mode?: ShowSearchMode;
}): Promise<{ result: PagedResult<Show>; warning: string | null }> {
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
        ...(language?.length && { language }),
        ...(mode && { mode }),
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
  const warning: string | null = json.status === "partial_success" ? (json.warning ?? null) : null;
  const result = ensureOkApiResponse<Show>(json, 1, pageSize);

  return { result, warning };
}

/* =========================
 * Episodes
 * ========================= */
export async function searchEpisodesFromApi({
  query,
  page,
  pageSize,
  lang,
  mode,
}: {
  query: string;
  page: number;
  pageSize: number;
  lang: LangFilter;
  mode?: SearchMode;
}): Promise<{ result: PagedResult<Episode>; searchRequestId: string; warning: string | null }> {
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
        lang,
        ...(mode && { mode }),
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
  const searchRequestId: string = json.searchRequestId ?? "";
  const warning: string | null = json.status === "partial_success" ? (json.warning ?? null) : null;
  const result = ensureOkApiResponse<Episode>(json, page, pageSize);

  return { result, searchRequestId, warning };
}

/* =========================
 * Rankings
 * ========================= */
export async function getRankingsFromApi({
  region = "tw",
  type = "podcast",
  limit = 20,
}: {
  region?: string;
  type?: string;
  limit?: number;
}): Promise<RankingsResult> {
  const apiBaseUrl = getApiBaseUrl();
  const params = new URLSearchParams({
    region,
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

  if (!json.data || typeof json.data !== "object") {
    return { region, type, items: [] };
  }

  return {
    ...json.data,
    region: json.data.region ?? json.data.country ?? region,
  };
}

/* =========================
 * Shows Batch
 * ========================= */
export async function batchGetShowDetailsFromApi(
  showIds: string[]
): Promise<Record<string, ShowDetail>> {
  if (showIds.length === 0) {
    return {};
  }

  const apiBaseUrl = getApiBaseUrl();
  const params = new URLSearchParams({
    ids: showIds.join(","),
  });

  const res = await fetch(`${apiBaseUrl}/shows/batch?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SearchApiError(
      `Batch shows API error: ${res.status}`,
      res.status
    );
  }

  const json = await res.json();

  if (!json || typeof json !== "object") {
    throw new SearchApiError("Invalid API response", 500);
  }

  if (json.status === "error") {
    throw new SearchApiError(
      json.error?.message ?? "Batch shows API error",
      400
    );
  }

  return json.data ?? {};
}

