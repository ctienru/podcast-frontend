import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchBehaviorSection } from "./MatchBehaviorSection";

const defaultTranslations = {
  matchBehavior: "Match behavior",
  matchBehaviorHelp: "How strictly should the query be matched?",
  matchSmartRecommended: "Smart (recommended)",
  matchSmartDesc: "Find relevant results, even if wording differs",
  matchKeyword: "Keyword",
  matchKeywordDesc: "Match important words only",
  matchExact: "Exact phrase",
  matchExactDesc: "Match the exact wording",
};

describe("MatchBehaviorSection", () => {
  describe("Rendering", () => {
    it("should render section title and help text", () => {
      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Match behavior")).toBeInTheDocument();
      expect(screen.getByText("How strictly should the query be matched?")).toBeInTheDocument();
    });

    it("should render all three radio options", () => {
      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("radio", { name: /smart \(recommended\)/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /keyword/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /exact phrase/i })).toBeInTheDocument();
    });

    it("should render descriptions for each option", () => {
      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Find relevant results, even if wording differs")).toBeInTheDocument();
      expect(screen.getByText("Match important words only")).toBeInTheDocument();
      expect(screen.getByText("Match the exact wording")).toBeInTheDocument();
    });
  });

  describe("Selection state", () => {
    it("should have Smart selected when value is hybrid", () => {
      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      const smartRadio = screen.getByRole("radio", { name: /smart \(recommended\)/i });
      expect(smartRadio).toBeChecked();
    });

    it("should have Keyword selected when value is bm25", () => {
      render(
        <MatchBehaviorSection
          value="bm25"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      const keywordRadio = screen.getByRole("radio", { name: /keyword/i });
      expect(keywordRadio).toBeChecked();
    });

    it("should have Exact phrase selected when value is exact", () => {
      render(
        <MatchBehaviorSection
          value="exact"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      const exactRadio = screen.getByRole("radio", { name: /exact phrase/i });
      expect(exactRadio).toBeChecked();
    });
  });

  describe("Interaction", () => {
    it("should call onChange with correct value when Smart is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <MatchBehaviorSection
          value="bm25"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("radio", { name: /smart \(recommended\)/i }));

      expect(onChange).toHaveBeenCalledWith("hybrid");
    });

    it("should call onChange with correct value when Keyword is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("radio", { name: /keyword/i }));

      expect(onChange).toHaveBeenCalledWith("bm25");
    });

    it("should call onChange with correct value when Exact phrase is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("radio", { name: /exact phrase/i }));

      expect(onChange).toHaveBeenCalledWith("exact");
    });

    it("should be able to click on label to select option", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      // Click on the label text instead of the radio button
      await user.click(screen.getByText("Keyword"));

      expect(onChange).toHaveBeenCalledWith("bm25");
    });
  });

  describe("Accessibility", () => {
    it("should have proper radio group structure", () => {
      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(3);
    });

    it("should have labels associated with radio buttons", () => {
      render(
        <MatchBehaviorSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      // All radio buttons should have accessible names
      expect(screen.getByRole("radio", { name: /smart \(recommended\)/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /keyword/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /exact phrase/i })).toBeInTheDocument();
    });
  });
});
