import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltersAppliedBar } from "./FiltersAppliedBar";

const defaultTranslations = {
  filtersApplied: "Filters applied:",
  editFilters: "Edit",
  matchSmart: "Smart",
  matchKeyword: "Keyword",
  matchExact: "Exact phrase",
  langAny: "Any language",
  langZhOnly: "Chinese only",
  langEnOnly: "English only",
};

describe("FiltersAppliedBar", () => {
  describe("Visibility", () => {
    it("should not render when using default filters (hybrid + hybrid)", () => {
      const { container } = render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="hybrid"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render when mode is non-default", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="hybrid"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Filters applied:")).toBeInTheDocument();
    });

    it("should render when lang is non-default", () => {
      render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Filters applied:")).toBeInTheDocument();
    });

    it("should render when both are non-default", () => {
      render(
        <FiltersAppliedBar
          mode="exact"
          lang="en"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Filters applied:")).toBeInTheDocument();
    });
  });

  describe("Display labels", () => {
    it("should display correct mode label for hybrid", () => {
      render(
        <FiltersAppliedBar
          mode="hybrid"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/smart/i)).toBeInTheDocument();
    });

    it("should display correct mode label for bm25", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/keyword/i)).toBeInTheDocument();
    });

    it("should display correct mode label for exact", () => {
      render(
        <FiltersAppliedBar
          mode="exact"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/exact phrase/i)).toBeInTheDocument();
    });

    it("should display correct lang label for hybrid", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="hybrid"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/any language/i)).toBeInTheDocument();
    });

    it("should display correct lang label for zh", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/chinese only/i)).toBeInTheDocument();
    });

    it("should display correct lang label for en", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="en"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/english only/i)).toBeInTheDocument();
    });

    it("should display both labels separated by ·", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText(/keyword · chinese only/i)).toBeInTheDocument();
    });
  });

  describe("Edit button", () => {
    it("should call onEdit when Edit button is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh"
          onEdit={onEdit}
          translations={defaultTranslations}
        />
      );

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("should have Edit button with correct label", () => {
      render(
        <FiltersAppliedBar
          mode="bm25"
          lang="zh"
          onEdit={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });
});
