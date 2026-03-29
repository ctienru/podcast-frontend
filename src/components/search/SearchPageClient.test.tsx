import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchPageClient } from "./SearchPageClient";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
let mockLocale = "zh-TW";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
  useParams: () => ({ locale: mockLocale }),
}));

const defaultTranslations = {
  advanced: "Advanced",
  advancedTitle: "Advanced Search",
  advancedSubtitle: "Refine how results are matched and filtered",
  matchBehavior: "Match behavior",
  matchBehaviorHelp: "How strictly should the query be matched?",
  matchSmart: "Smart",
  matchSmartRecommended: "Smart (recommended)",
  matchSmartDesc: "Find relevant results, even if wording differs",
  matchKeyword: "Keyword",
  matchKeywordDesc: "Match important words only",
  matchExact: "Exact phrase",
  matchExactDesc: "Match the exact wording",
  language: "Language",
  languageHelp: "Which languages should results include?",
  langZhTw: "Traditional Chinese",
  langZhCn: "Simplified Chinese",
  langEn: "English",
  langZhBoth: "Both Chinese scripts",
  applyFilters: "Apply filters",
  reset: "Reset",
  filtersApplied: "Filters applied:",
  editFilters: "Edit",
};

describe("SearchPageClient", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLocale = "zh-TW";
    mockSearchParams.delete("mode");
    mockSearchParams.delete("lang");
    mockSearchParams.delete("page");
    mockSearchParams.delete("q");
  });

  describe("Advanced Search Panel", () => {
    it("should show Advanced button by default", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );
      expect(screen.getByRole("button", { name: /advanced/i })).toBeInTheDocument();
    });

    it("should not show panel when Advanced button is not clicked", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );
      expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
    });

    it("should open panel when Advanced button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));

      expect(screen.getByText("Advanced Search")).toBeInTheDocument();
      expect(screen.getByText("Match behavior")).toBeInTheDocument();
    });

    it("should close panel when Advanced button is clicked again", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      const btn = screen.getByRole("button", { name: /advanced/i });
      await user.click(btn);
      expect(screen.getByText("Advanced Search")).toBeInTheDocument();

      await user.click(btn);
      expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
    });

    it("should close panel after applying filters", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      expect(screen.getByText("Advanced Search")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
      });
    });

    it("should close panel after reset", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh-cn"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      expect(screen.getByText("Advanced Search")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
      });
    });
  });

  describe("handleApply — locale-aware URL logic (locale=zh-TW, defaultLang=zh-tw)", () => {
    // useParams mock returns locale="zh-TW" → defaultLang = "zh-tw"

    it("default lang (zh-tw): omits lang param from URL", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        const url = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(url).not.toContain("lang=");
      });
    });

    it("non-default lang (zh-cn): includes lang=zh-cn in URL", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-cn"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("lang=zh-cn")
        );
      });
    });

    it("non-default lang (en): includes lang=en in URL", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="en"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("lang=en")
        );
      });
    });
  });

  describe("locale-aware defaults across locales", () => {
    it("omits lang param for en locale when selected lang matches locale default", async () => {
      const user = userEvent.setup();
      mockLocale = "en";
      mockSearchParams.set("q", "ai");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="en"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        const url = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(url).not.toContain("lang=");
      });
    });

    it("omits lang param for zh-CN locale when selected lang matches locale default", async () => {
      const user = userEvent.setup();
      mockLocale = "zh-CN";
      mockSearchParams.set("q", "科技");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-cn"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        const url = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(url).not.toContain("lang=");
      });
    });
  });

  describe("handleApply — mode URL logic", () => {
    it("default mode (hybrid): omits mode param from URL", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");
      mockSearchParams.set("mode", "bm25");

      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("radio", { name: /smart \(recommended\)/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.not.stringContaining("mode=")
        );
      });
    });

    it("resets page to 1 when applying filters", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");
      mockSearchParams.set("page", "3");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("radio", { name: /keyword/i }));
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.not.stringContaining("page=")
        );
      });
    });
  });

  describe("handleReset", () => {
    it("removes mode, lang, and page from URL", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");
      mockSearchParams.set("mode", "bm25");
      mockSearchParams.set("lang", "zh-cn");

      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh-cn"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        const url = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(url).not.toContain("mode=");
        expect(url).not.toContain("lang=");
      });
    });
  });

  describe("filters applied state", () => {
    it("hides the applied bar when using default filters", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="zh-tw"
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByTestId("filters-applied-bar")).not.toBeInTheDocument();
    });

    it("shows the applied bar when using non-default filters", () => {
      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="en"
          translations={defaultTranslations}
        />
      );

      expect(screen.getByTestId("filters-applied-bar")).toBeInTheDocument();
      expect(screen.getByText(/filters applied:/i)).toBeInTheDocument();
    });
  });
});
