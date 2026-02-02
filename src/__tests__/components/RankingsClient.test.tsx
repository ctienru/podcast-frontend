import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RankingsClient } from "@/app/[locale]/rankings/RankingsClient";
import type { RankingsResult, RankingsItem } from "@/types/search";

// Mock router
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock clipboard
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

const defaultTranslations = {
  selectCountry: "Select Country",
  taiwan: "Taiwan",
  unitedStates: "United States",
  podcast: "Podcast",
  episode: "Episode",
  noResults: "No results",
  episodes: "episodes",
  updatedAt: "Updated __time__",
};

const createMockItem = (overrides?: Partial<RankingsItem>): RankingsItem => ({
  rank: 1,
  showId: "show-1",
  title: "Top Podcast",
  publisher: "Publisher One",
  imageUrl: "https://example.com/image.jpg",
  episodeCount: 100,
  ...overrides,
});

const createMockRankings = (
  overrides?: Partial<RankingsResult>
): RankingsResult => ({
  country: "tw",
  type: "podcast",
  items: [createMockItem()],
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("RankingsClient", () => {
  describe("basic rendering", () => {
    it("should render country selector", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render type tabs", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("tab", { name: "Podcast" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Episode" })).toBeInTheDocument();
    });

    it("should render rankings list", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Top Podcast")).toBeInTheDocument();
    });
  });

  describe("rankings display", () => {
    it("should display rank number", () => {
      const rankings = createMockRankings({
        items: [createMockItem({ rank: 1 }), createMockItem({ rank: 2, showId: "show-2", title: "Second" })],
      });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should display podcast title", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Top Podcast")).toBeInTheDocument();
    });

    it("should display publisher", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/Publisher One/)).toBeInTheDocument();
    });

    it("should display episode count for podcast type", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/100 episodes/)).toBeInTheDocument();
    });

    it("should not display episode count for episode type", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings({ type: "episode" })}
          initialCountry="tw"
          initialType="episode"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByText(/episodes/)).not.toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("should show no results message when items is empty", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings({ items: [] })}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("No results")).toBeInTheDocument();
    });

    it("should show no results when initialRankings is null", () => {
      render(
        <RankingsClient
          initialRankings={null}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("No results")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should display error message when error is provided", () => {
      render(
        <RankingsClient
          initialRankings={null}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error="Failed to load rankings"
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Failed to load rankings")).toBeInTheDocument();
    });

    it("should not render list when error exists", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error="Error"
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("country selection", () => {
    it("should render country selector with initial value", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      // Select component should be rendered
      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      // Taiwan should be the selected value (shown in trigger)
      expect(screen.getByText("Taiwan")).toBeInTheDocument();
    });

    it("should show US when initialCountry is us", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings({ country: "us" })}
          initialCountry="us"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("United States")).toBeInTheDocument();
    });
  });

  describe("type selection", () => {
    it("should update URL when type is changed to episode", async () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      await userEvent.click(screen.getByRole("tab", { name: "Episode" }));

      expect(mockPush).toHaveBeenCalledWith("?type=episode");
    });

    it("should highlight active tab", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      const podcastTab = screen.getByRole("tab", { name: "Podcast" });
      expect(podcastTab).toHaveAttribute("data-state", "active");
    });
  });

  describe("image handling", () => {
    it("should display image when available", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    it("should use placeholder when image is missing", () => {
      const rankings = createMockRankings({
        items: [createMockItem({ imageUrl: undefined })],
      });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });

    it("should fallback to placeholder on error", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      const img = screen.getByRole("img");
      fireEvent.error(img);

      expect(img).toHaveAttribute("src", "/placeholder-podcast.svg");
    });
  });

  describe("updated time", () => {
    it("should display updated time when available", () => {
      const recentTime = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const rankings = createMockRankings({ updatedAt: recentTime });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });

    it("should not display updated time when missing", () => {
      const rankings = createMockRankings({ updatedAt: undefined });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    });
  });

  describe("formatRelativeTime", () => {
    it("should show 'just now' for very recent times", () => {
      const justNow = new Date().toISOString();
      const rankings = createMockRankings({ updatedAt: justNow });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/just now/)).toBeInTheDocument();
    });

    it("should show minutes ago", () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const rankings = createMockRankings({ updatedAt: fiveMinAgo });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/5m ago/)).toBeInTheDocument();
    });

    it("should show hours ago", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const rankings = createMockRankings({ updatedAt: twoHoursAgo });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/2h ago/)).toBeInTheDocument();
    });

    it("should show days ago", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const rankings = createMockRankings({ updatedAt: threeDaysAgo });

      render(
        <RankingsClient
          initialRankings={rankings}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/3d ago/)).toBeInTheDocument();
    });
  });

  describe("copy functionality", () => {
    it("should have copyable titles", () => {
      render(
        <RankingsClient
          initialRankings={createMockRankings()}
          initialCountry="tw"
          initialType="podcast"
          locale="en"
          error={null}
          translations={defaultTranslations}
        />
      );

      // CopyableTitle renders with role="button"
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
