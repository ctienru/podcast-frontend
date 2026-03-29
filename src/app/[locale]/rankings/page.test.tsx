import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RankingsPage from "./page";

const { mockGetRankingsFromApi, mockSetRequestLocale } = vi.hoisted(() => ({
  mockGetRankingsFromApi: vi.fn(),
  mockSetRequestLocale: vi.fn(),
}));

vi.mock("@/lib/search", () => ({
  getRankingsFromApi: mockGetRankingsFromApi,
}));

vi.mock("next-intl/server", () => ({
  setRequestLocale: mockSetRequestLocale,
  getTranslations: async () => (key: string) => key,
}));

vi.mock("./RankingsClient", () => ({
  RankingsClient: ({
    initialRegion,
    initialType,
  }: {
    initialRegion: string;
    initialType: string;
  }) => (
    <div data-testid="rankings-client">
      {initialRegion}:{initialType}
    </div>
  ),
}));

describe("RankingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRankingsFromApi.mockResolvedValue({
      region: "tw",
      type: "podcast",
      items: [],
    });
  });

  it("defaults zh-TW rankings to region=tw", async () => {
    render(
      await RankingsPage({
        params: Promise.resolve({ locale: "zh-TW" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(mockSetRequestLocale).toHaveBeenCalledWith("zh-TW");
    expect(mockGetRankingsFromApi).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "tw",
        type: "podcast",
        limit: 100,
      })
    );
    expect(screen.getByTestId("rankings-client")).toHaveTextContent("tw:podcast");
  });

  it("defaults zh-CN rankings to region=cn", async () => {
    render(
      await RankingsPage({
        params: Promise.resolve({ locale: "zh-CN" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(mockGetRankingsFromApi).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "cn",
        type: "podcast",
        limit: 100,
      })
    );
    expect(screen.getByTestId("rankings-client")).toHaveTextContent("cn:podcast");
  });

  it("defaults en rankings to region=us and preserves explicit type", async () => {
    render(
      await RankingsPage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({ type: "episode" }),
      })
    );

    expect(mockGetRankingsFromApi).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "us",
        type: "episode",
        limit: 100,
      })
    );
    expect(screen.getByTestId("rankings-client")).toHaveTextContent("us:episode");
  });
});
