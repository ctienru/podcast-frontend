import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchPageClient } from "./SearchPageClient";

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
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
  langAny: "Any language",
  langZhOnly: "Chinese only",
  langEnOnly: "English only",
  applyFilters: "Apply filters",
  reset: "Reset",
  filtersApplied: "Filters applied:",
  editFilters: "Edit",
};

describe("SearchPageClient", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete("mode");
    mockSearchParams.delete("lang");
    mockSearchParams.delete("page");
  });

  describe("Default behavior", () => {
    it("should not show FiltersAppliedBar when using default filters", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByText("Filters applied:")).not.toBeInTheDocument();
    });

    it("should show Advanced button by default", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("button", { name: /advanced/i })).toBeInTheDocument();
    });

    it("should not show panel when Advanced button is not clicked", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
    });
  });

  describe("Advanced Search Panel", () => {
    it("should open panel when Advanced button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      const advancedButton = screen.getByRole("button", { name: /advanced/i });
      await user.click(advancedButton);

      expect(screen.getByText("Advanced Search")).toBeInTheDocument();
      expect(screen.getByText("Match behavior")).toBeInTheDocument();
      expect(screen.getByText("Language")).toBeInTheDocument();
    });

    it("should close panel when Advanced button is clicked again", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      const advancedButton = screen.getByRole("button", { name: /advanced/i });
      await user.click(advancedButton);
      expect(screen.getByText("Advanced Search")).toBeInTheDocument();

      await user.click(advancedButton);
      expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
    });

    it("should have Smart and Any language selected by default", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));

      const smartRadio = screen.getByRole("radio", { name: /smart \(recommended\)/i });
      expect(smartRadio).toBeChecked();
    });
  });

  describe("Apply filters", () => {
    it("should update URL when applying non-default filters", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      // Open panel
      await user.click(screen.getByRole("button", { name: /advanced/i }));

      // Select Keyword mode
      await user.click(screen.getByRole("radio", { name: /keyword/i }));

      // Select Chinese only
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /chinese only/i }));

      // Apply
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("mode=bm25")
        );
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("lang=zh")
        );
      });
    });

    it("should remove mode parameter when applying default mode", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");
      mockSearchParams.set("mode", "bm25");

      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="hybrid"
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

    it("should reset page to 1 when applying filters", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");
      mockSearchParams.set("page", "3");

      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
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

    it("should close panel after applying filters", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
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
  });

  describe("Reset filters", () => {
    it("should reset to default filters when Reset is clicked", async () => {
      const user = userEvent.setup();
      mockSearchParams.set("q", "test");
      mockSearchParams.set("mode", "bm25");
      mockSearchParams.set("lang", "zh");

      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh"
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));
      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(lastCall).not.toContain("mode=");
        expect(lastCall).not.toContain("lang=");
      });
    });

    it("should close panel after reset", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh"
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

  describe("FiltersAppliedBar", () => {
    it("should show FiltersAppliedBar when using non-default filters", () => {
      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh"
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Filters applied:")).toBeInTheDocument();
      expect(screen.getByText(/keyword/i)).toBeInTheDocument();
      expect(screen.getByText(/chinese only/i)).toBeInTheDocument();
    });

    it("should open Advanced panel when Edit button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SearchPageClient
          currentMode="bm25"
          currentLang="zh"
          translations={defaultTranslations}
        />
      );

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByText("Advanced Search")).toBeInTheDocument();
    });

    it("should hide when mode is hybrid and lang is hybrid", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByText("Filters applied:")).not.toBeInTheDocument();
    });

    it("should show when only mode is non-default", () => {
      render(
        <SearchPageClient
          currentMode="exact"
          currentLang="hybrid"
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Filters applied:")).toBeInTheDocument();
      expect(screen.getByText(/exact phrase/i)).toBeInTheDocument();
    });

    it("should show when only lang is non-default", () => {
      render(
        <SearchPageClient
          currentMode="hybrid"
          currentLang="en"
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Filters applied:")).toBeInTheDocument();
      expect(screen.getByText(/english only/i)).toBeInTheDocument();
    });
  });
});
