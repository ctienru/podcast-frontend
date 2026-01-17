import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyableTitle } from "@/components/CopyableTitle";
import { toast } from "sonner";

// Mock navigator.clipboard
const mockWriteText = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText.mockResolvedValue(undefined),
    },
  });
});

describe("CopyableTitle", () => {
  describe("rendering", () => {
    it("should render children correctly", () => {
      render(
        <CopyableTitle title="Test Title">
          <span>Display Text</span>
        </CopyableTitle>
      );

      expect(screen.getByText("Display Text")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <CopyableTitle title="Test" className="custom-class">
          Content
        </CopyableTitle>
      );

      const element = screen.getByRole("button");
      expect(element).toHaveClass("custom-class");
    });

    it("should have cursor-pointer class", () => {
      render(<CopyableTitle title="Test">Content</CopyableTitle>);

      const element = screen.getByRole("button");
      expect(element).toHaveClass("cursor-pointer");
    });
  });

  describe("accessibility", () => {
    it("should have role=button", () => {
      render(<CopyableTitle title="Test">Content</CopyableTitle>);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have tabIndex=0 for keyboard navigation", () => {
      render(<CopyableTitle title="Test">Content</CopyableTitle>);

      const element = screen.getByRole("button");
      expect(element).toHaveAttribute("tabIndex", "0");
    });

    it("should have title attribute for tooltip", () => {
      render(<CopyableTitle title="Test">Content</CopyableTitle>);

      const element = screen.getByRole("button");
      expect(element).toHaveAttribute("title", "clickToCopy");
    });
  });

  describe("click to copy", () => {
    it("should call clipboard.writeText with title on click", async () => {
      render(<CopyableTitle title="My Title">Content</CopyableTitle>);

      await userEvent.click(screen.getByRole("button"));

      expect(mockWriteText).toHaveBeenCalledWith("My Title");
    });

    it("should show success toast after copying", async () => {
      render(<CopyableTitle title="Test">Content</CopyableTitle>);

      await userEvent.click(screen.getByRole("button"));

      expect(toast.success).toHaveBeenCalledWith("copySuccess");
    });

    it("should copy different titles correctly", async () => {
      render(
        <CopyableTitle title="特別的中文標題">
          中文內容
        </CopyableTitle>
      );

      await userEvent.click(screen.getByRole("button"));

      expect(mockWriteText).toHaveBeenCalledWith("特別的中文標題");
    });
  });

  describe("keyboard support", () => {
    it("should trigger copy on Enter key", async () => {
      render(<CopyableTitle title="Test Title">Content</CopyableTitle>);

      const element = screen.getByRole("button");
      fireEvent.keyDown(element, { key: "Enter" });

      expect(mockWriteText).toHaveBeenCalledWith("Test Title");
    });

    it("should trigger copy on Space key", async () => {
      render(<CopyableTitle title="Test Title">Content</CopyableTitle>);

      const element = screen.getByRole("button");
      fireEvent.keyDown(element, { key: " " });

      expect(mockWriteText).toHaveBeenCalledWith("Test Title");
    });

    it("should not trigger copy on other keys", () => {
      render(<CopyableTitle title="Test">Content</CopyableTitle>);

      const element = screen.getByRole("button");
      fireEvent.keyDown(element, { key: "a" });
      fireEvent.keyDown(element, { key: "Tab" });
      fireEvent.keyDown(element, { key: "Escape" });

      expect(mockWriteText).not.toHaveBeenCalled();
    });
  });

  describe("fallback copy", () => {
    it("should use fallback when clipboard API fails", async () => {
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard not available"));

      // Mock document.execCommand
      const mockExecCommand = vi.fn();
      document.execCommand = mockExecCommand;

      render(<CopyableTitle title="Fallback Test">Content</CopyableTitle>);

      await userEvent.click(screen.getByRole("button"));

      // Should still show success toast (fallback succeeded)
      expect(toast.success).toHaveBeenCalledWith("copySuccess");
    });
  });

  describe("complex children", () => {
    it("should handle JSX children", () => {
      render(
        <CopyableTitle title="Complex Title">
          <span className="highlight">Highlighted</span>
          <span> text</span>
        </CopyableTitle>
      );

      expect(screen.getByText("Highlighted")).toBeInTheDocument();
      expect(screen.getByText("text")).toBeInTheDocument();
    });

    it("should copy title, not children text", async () => {
      render(
        <CopyableTitle title="Original Title">
          Display Different Text
        </CopyableTitle>
      );

      await userEvent.click(screen.getByRole("button"));

      expect(mockWriteText).toHaveBeenCalledWith("Original Title");
    });
  });
});
