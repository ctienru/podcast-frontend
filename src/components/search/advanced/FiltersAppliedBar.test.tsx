import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltersAppliedBar } from "./FiltersAppliedBar";
import type { LangFilter } from "@/types/search";

const defaultTranslations = {
  filtersApplied: "Filters applied:",
  editFilters: "Edit",
  matchSmart: "Smart",
  matchKeyword: "Keyword",
  matchExact: "Exact phrase",
  langZhTw: "Traditional Chinese",
  langZhCn: "Simplified Chinese",
  langEn: "English",
  langZhBoth: "Both Chinese scripts",
};

describe("FiltersAppliedBar", () => {
  describe("Visibility — default filters = mode:hybrid + lang:defaultLang", () => {
    it("should not render when mode=hybrid and lang=defaultLang (zh-tw)", () => {
      const { container } = render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="zh-tw"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render when mode=hybrid and lang=defaultLang (en)", () => {
      const { container } = render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="en"
          defaultLang="en"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render when lang differs from defaultLang", () => {
      render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="zh-cn"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByTestId("filters-applied-bar")).toBeInTheDocument();
    });

    it("should render when mode is non-default", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh-tw"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByTestId("filters-applied-bar")).toBeInTheDocument();
    });

    it("should render when both mode and lang are non-default", () => {
      render(
        <FiltersAppliedBar
          mode="exact"
          lang="en"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByTestId("filters-applied-bar")).toBeInTheDocument();
    });
  });

  describe("Display labels — mode", () => {
    it("should display Smart label when mode=hybrid", () => {
      render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="zh-cn"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/smart/i)).toBeInTheDocument();
    });

    it("should display Keyword label when mode=bm25", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh-tw"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/keyword/i)).toBeInTheDocument();
    });

    it("should display Exact phrase label when mode=exact", () => {
      render(
        <FiltersAppliedBar
          mode="exact"
          lang="zh-tw"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/exact phrase/i)).toBeInTheDocument();
    });
  });

  describe("Display labels — lang", () => {
    it.each([
      ["en",    "zh-tw",   "Traditional Chinese"],
      ["en",    "zh-cn",   "Simplified Chinese"],
      ["zh-tw", "en",      "English"],
      ["zh-tw", "zh-both", "Both Chinese scripts"],
    ] as [LangFilter, LangFilter, string][])(
      "defaultLang=%s, lang=%s → shows '%s'",
      (defaultLang, lang, expectedLabel) => {
        render(
          <FiltersAppliedBar
            mode="bm25"
            lang={lang}
            defaultLang={defaultLang}
            onEdit={vi.fn()}
            translations={defaultTranslations}
          />
        );

        expect(screen.getByText(new RegExp(expectedLabel, "i"))).toBeInTheDocument();
      }
    );

    it("should display lang=zh-tw label when it is non-default (defaultLang=en)", () => {
      render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="zh-tw"
          defaultLang="en"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/traditional chinese/i)).toBeInTheDocument();
    });
  });

  describe("Display labels — combined", () => {
    it("should display mode and lang labels separated by ·", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh-cn"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/keyword · simplified chinese/i)).toBeInTheDocument();
    });
  });

  describe("Edit button", () => {
    it("should call onEdit when Edit button is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh-cn"
          defaultLang="zh-tw"
          onEdit={onEdit}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("should render Edit button with correct label", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh-cn"
          defaultLang="zh-tw"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });
});
