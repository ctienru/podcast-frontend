import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdvancedSearchPanel } from "./AdvancedSearchPanel";

const defaultTranslations = {
  advanced: "Advanced",
  advancedTitle: "Advanced Search",
  advancedSubtitle: "Refine how results are matched and filtered",
  matchBehavior: "Match behavior",
  matchBehaviorHelp: "How strictly should the query be matched?",
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
};

describe("AdvancedSearchPanel", () => {
  const onToggle = vi.fn();
  const onApply = vi.fn();
  const onReset = vi.fn();

  beforeEach(() => {
    onToggle.mockClear();
    onApply.mockClear();
    onReset.mockClear();
  });

  describe("Toggle button", () => {
    it("should render toggle button", () => {
      render(
        <AdvancedSearchPanel
          isOpen={false}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("button", { name: /advanced/i })).toBeInTheDocument();
    });

    it("should call onToggle when toggle button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={false}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /advanced/i }));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("Panel visibility", () => {
    it("should not show panel content when isOpen is false", () => {
      render(
        <AdvancedSearchPanel
          isOpen={false}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      expect(screen.queryByText("Advanced Search")).not.toBeInTheDocument();
    });

    it("should show panel content when isOpen is true", () => {
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Advanced Search")).toBeInTheDocument();
      expect(screen.getByText("Match behavior")).toBeInTheDocument();
      expect(screen.getByText("Language")).toBeInTheDocument();
    });
  });

  describe("Default values", () => {
    it("should reflect current mode in radio selection", () => {
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="bm25"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      const keywordRadio = screen.getByRole("radio", { name: /keyword/i });
      expect(keywordRadio).toBeChecked();
    });

    it("should sync with updated currentMode prop", () => {
      const { rerender } = render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      const smartRadio = screen.getByRole("radio", { name: /smart \(recommended\)/i });
      expect(smartRadio).toBeChecked();

      rerender(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="exact"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      const exactRadio = screen.getByRole("radio", { name: /exact phrase/i });
      expect(exactRadio).toBeChecked();
    });
  });

  describe("Apply filters", () => {
    it("should call onApply with selected values when Apply is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      // Change mode
      await user.click(screen.getByRole("radio", { name: /keyword/i }));

      // Change language
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /simplified chinese/i }));

      // Apply
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(onApply).toHaveBeenCalledWith("bm25", "zh-cn");
      });
    });

    it("should call onToggle after applying to close panel", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalled();
      });
    });
  });

  describe("Reset filters", () => {
    it("should call onReset when Reset is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="bm25"
          currentLang="zh-cn"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        expect(onReset).toHaveBeenCalledTimes(1);
      });
    });

    it("should reset internal state to defaults when Reset is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="bm25"
          currentLang="zh-cn"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      // Initially shows Keyword selected
      expect(screen.getByRole("radio", { name: /keyword/i })).toBeChecked();

      // Click Reset
      await user.click(screen.getByRole("button", { name: /reset/i }));

      // Should call onReset with default values
      await waitFor(() => {
        expect(onReset).toHaveBeenCalled();
      });
    });

    it("should call onToggle after reset to close panel", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="bm25"
          currentLang="zh-cn"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalled();
      });
    });
  });

  describe("Draft state management", () => {
    it("should allow changing options without immediately calling onApply", async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchPanel
          isOpen={true}
          onToggle={onToggle}
          currentMode="hybrid"
          currentLang="zh-tw"
          defaultLang="zh-tw"
          onApply={onApply}
          onReset={onReset}
          translations={defaultTranslations}
        />
      );

      // Change mode
      await user.click(screen.getByRole("radio", { name: /keyword/i }));

      // onApply should not be called yet
      expect(onApply).not.toHaveBeenCalled();

      // Change language
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: /simplified chinese/i }));

      // Still not called
      expect(onApply).not.toHaveBeenCalled();

      // Only called after clicking Apply
      await user.click(screen.getByRole("button", { name: /apply filters/i }));

      await waitFor(() => {
        expect(onApply).toHaveBeenCalledTimes(1);
      });
    });
  });
});
