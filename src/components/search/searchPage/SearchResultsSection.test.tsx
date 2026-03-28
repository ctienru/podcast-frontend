import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchResultsSection from "./SearchResultsSection";
import type { Episode, Show } from "@/types/search";

const {
  mockSearchEpisodesFromApi,
  mockSearchShowsFromApi,
} = vi.hoisted(() => ({
  mockSearchEpisodesFromApi: vi.fn(),
  mockSearchShowsFromApi: vi.fn(),
}));

vi.mock("@/lib/search", () => ({
  searchEpisodesFromApi: mockSearchEpisodesFromApi,
  searchShowsFromApi: mockSearchShowsFromApi,
}));

vi.mock("@/lib/schema", () => ({
  buildSearchItemListSchema: () => ({ "@type": "ItemList" }),
}));

vi.mock("@/components/search/searchPage/SearchSummary", () => ({
  SearchSummary: ({ query, total }: { query: string; total: number }) => (
    <div data-testid="search-summary">
      {query}:{total}
    </div>
  ),
}));

vi.mock("@/components/search/searchPage/SearchResultsClient", () => ({
  SearchResultsClient: ({ episodes }: { episodes: Episode[] }) => (
    <div data-testid="search-results-client">
      {episodes.map((episode) => (
        <div key={episode.episodeId}>{episode.title}</div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/search/searchPage/ShowsBanner", () => ({
  ShowsBanner: ({ shows }: { shows: Show[] }) => (
    <div data-testid="shows-banner">{shows.map((show) => show.title).join(",")}</div>
  ),
}));

vi.mock("@/components/search/SearchError", () => ({
  SearchError: ({ message }: { message?: string }) => <div>{message ?? "error"}</div>,
}));

vi.mock("@/components/search/SearchEmpty", () => ({
  SearchEmpty: ({ query }: { query: string }) => <div>No results for {query}</div>,
}));

const createEpisode = (overrides?: Partial<Episode>): Episode => ({
  episodeId: "episode-1",
  title: "AI Weekly",
  description: "Latest AI news",
  publishedAt: "2026-03-28T12:00:00.000Z",
  durationSec: 1800,
  language: "en",
  podcast: {
    showId: "show-1",
    title: "AI Show",
    publisher: "Open Mic",
  },
  ...overrides,
});

describe("SearchResultsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchEpisodesFromApi.mockResolvedValue({
      result: {
        items: [createEpisode()],
        total: 1,
        page: 1,
        pageSize: 10,
      },
      searchRequestId: "req-1",
      warning: null,
    });
    mockSearchShowsFromApi.mockResolvedValue({
      result: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
      warning: null,
    });
  });

  it("shows a non-blocking warning banner when episode search is partial_success", async () => {
    mockSearchEpisodesFromApi.mockResolvedValueOnce({
      result: {
        items: [createEpisode({ title: "Degraded Result" })],
        total: 1,
        page: 1,
        pageSize: 10,
      },
      searchRequestId: "req-degraded",
      warning: "embedding unavailable",
    });

    render(await SearchResultsSection({ query: "AI", page: 1, lang: "en", mode: "hybrid" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("degradedWarningTitle")).toBeInTheDocument();
    expect(screen.getByText("Degraded Result")).toBeInTheDocument();
  });

  it("shows a non-blocking warning banner when show search is partial_success", async () => {
    mockSearchShowsFromApi.mockResolvedValueOnce({
      result: {
        items: [{ showId: "show-2", title: "Tech Talk", publisher: "Podcaster" }],
        total: 1,
        page: 1,
        pageSize: 10,
      },
      warning: "show fallback",
    });

    render(await SearchResultsSection({ query: "科技", page: 1, lang: "zh-tw", mode: "hybrid" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Tech Talk")).toBeInTheDocument();
    expect(screen.getByText("AI Weekly")).toBeInTheDocument();
  });

  it("does not show the warning banner when both searches are fully successful", async () => {
    render(await SearchResultsSection({ query: "AI", page: 1, lang: "en", mode: "hybrid" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("AI Weekly")).toBeInTheDocument();
  });
});
