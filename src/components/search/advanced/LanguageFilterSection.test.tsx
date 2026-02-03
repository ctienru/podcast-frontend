import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageFilterSection } from "./LanguageFilterSection";

const defaultTranslations = {
  language: "Language",
  languageHelp: "Which languages should results include?",
  langAny: "Any language",
  langZhOnly: "Chinese only",
  langEnOnly: "English only",
};

describe("LanguageFilterSection", () => {
  describe("Rendering", () => {
    it("should render section title and help text", () => {
      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByText("Language")).toBeInTheDocument();
      expect(screen.getByText("Which languages should results include?")).toBeInTheDocument();
    });

    it("should render select dropdown", () => {
      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Selection state", () => {
    it("should show Any language when value is hybrid", () => {
      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Any language");
    });

    it("should show Chinese only when value is zh", () => {
      render(
        <LanguageFilterSection
          value="zh"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Chinese only");
    });

    it("should show English only when value is en", () => {
      render(
        <LanguageFilterSection
          value="en"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("English only");
    });
  });

  describe("Interaction", () => {
    it("should show all options when dropdown is opened", async () => {
      const user = userEvent.setup();

      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("option", { name: "Any language" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Chinese only" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "English only" })).toBeInTheDocument();
    });

    it("should call onChange with hybrid when Any language is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="zh"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Any language" }));

      expect(onChange).toHaveBeenCalledWith("hybrid");
    });

    it("should call onChange with zh when Chinese only is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Chinese only" }));

      expect(onChange).toHaveBeenCalledWith("zh");
    });

    it("should call onChange with en when English only is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "English only" }));

      expect(onChange).toHaveBeenCalledWith("en");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible combobox", () => {
      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
    });

    it("should have options with proper roles when opened", async () => {
      const user = userEvent.setup();

      render(
        <LanguageFilterSection
          value="hybrid"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });
  });
});
