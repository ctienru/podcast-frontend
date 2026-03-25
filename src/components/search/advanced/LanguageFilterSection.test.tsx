import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageFilterSection } from "./LanguageFilterSection";

const defaultTranslations = {
  language: "Language",
  languageHelp: "Which languages should results include?",
  langZhTw: "Traditional Chinese",
  langZhCn: "Simplified Chinese",
  langEn: "English",
  langZhBoth: "Both Chinese scripts",
};

describe("LanguageFilterSection", () => {
  describe("Rendering", () => {
    it("should render section title and help text", () => {
      render(
        <LanguageFilterSection
          value="zh-tw"
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
          value="zh-tw"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render all four language options when opened", async () => {
      const user = userEvent.setup();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("option", { name: "Traditional Chinese" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Simplified Chinese" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Both Chinese scripts" })).toBeInTheDocument();
    });

    it("should have exactly four options", async () => {
      const user = userEvent.setup();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.getAllByRole("option")).toHaveLength(4);
    });
  });

  describe("Selection state", () => {
    it("should show Traditional Chinese when value is zh-tw", () => {
      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Traditional Chinese");
    });

    it("should show Simplified Chinese when value is zh-cn", () => {
      render(
        <LanguageFilterSection
          value="zh-cn"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Simplified Chinese");
    });

    it("should show English when value is en", () => {
      render(
        <LanguageFilterSection
          value="en"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("English");
    });

    it("should show Both Chinese scripts when value is zh-both", () => {
      render(
        <LanguageFilterSection
          value="zh-both"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Both Chinese scripts");
    });
  });

  describe("Interaction", () => {
    it("should call onChange with zh-tw when Traditional Chinese is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="en"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Traditional Chinese" }));

      expect(onChange).toHaveBeenCalledWith("zh-tw");
    });

    it("should call onChange with zh-cn when Simplified Chinese is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Simplified Chinese" }));

      expect(onChange).toHaveBeenCalledWith("zh-cn");
    });

    it("should call onChange with en when English is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "English" }));

      expect(onChange).toHaveBeenCalledWith("en");
    });

    it("should call onChange with zh-both when Both Chinese scripts is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={onChange}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Both Chinese scripts" }));

      expect(onChange).toHaveBeenCalledWith("zh-both");
    });
  });

  describe("No legacy options", () => {
    it("should not render hybrid or Any language option", async () => {
      const user = userEvent.setup();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.queryByRole("option", { name: /any language/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /hybrid/i })).not.toBeInTheDocument();
    });

    it("should not render Chinese only or English only option", async () => {
      const user = userEvent.setup();

      render(
        <LanguageFilterSection
          value="zh-tw"
          onChange={vi.fn()}
          translations={defaultTranslations}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.queryByRole("option", { name: /chinese only/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /english only/i })).not.toBeInTheDocument();
    });
  });
});
