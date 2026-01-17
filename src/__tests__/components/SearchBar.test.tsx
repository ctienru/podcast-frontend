import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/search/header/SearchBar";

// Mock the router
const mockPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useSearchParams with different values per test
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParams = new URLSearchParams();
});

describe("SearchBar", () => {
  describe("initial rendering", () => {
    it("should render input and button", () => {
      render(<SearchBar />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "button" })).toBeInTheDocument();
    });

    it("should have placeholder text", () => {
      render(<SearchBar />);

      expect(screen.getByPlaceholderText("placeholder")).toBeInTheDocument();
    });

    it("should start with empty value when no query param", () => {
      render(<SearchBar />);

      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("should initialize with URL query value", () => {
      mockSearchParams = new URLSearchParams("q=initial+query");
      render(<SearchBar />);

      expect(screen.getByRole("textbox")).toHaveValue("initial query");
    });
  });

  describe("input interaction", () => {
    it("should update value on user input", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test search");

      expect(input).toHaveValue("test search");
    });

    it("should handle Chinese input", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "科技新聞");

      expect(input).toHaveValue("科技新聞");
    });

    it("should allow clearing input", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "something");
      await userEvent.clear(input);

      expect(input).toHaveValue("");
    });
  });

  describe("form submission", () => {
    it("should navigate with query param on submit", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "podcast");

      const form = input.closest("form");
      fireEvent.submit(form!);

      expect(mockPush).toHaveBeenCalledWith("?q=podcast&page=1");
    });

    it("should trim whitespace from query", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "  search term  ");

      fireEvent.submit(input.closest("form")!);

      expect(mockPush).toHaveBeenCalledWith("?q=search+term&page=1");
    });

    it("should remove q and page params for empty query", async () => {
      mockSearchParams = new URLSearchParams("q=old&page=2");
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.clear(input);

      fireEvent.submit(input.closest("form")!);

      expect(mockPush).toHaveBeenCalledWith("?");
    });

    it("should reset page to 1 on new search", async () => {
      mockSearchParams = new URLSearchParams("q=old&page=5");
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.clear(input);
      await userEvent.type(input, "new search");

      fireEvent.submit(input.closest("form")!);

      expect(mockPush).toHaveBeenCalledWith("?q=new+search&page=1");
    });

    it("should preserve other URL params", async () => {
      mockSearchParams = new URLSearchParams("sort=date&filter=audio");
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "query");

      fireEvent.submit(input.closest("form")!);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("sort=date")
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("filter=audio")
      );
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("q=query"));
    });
  });

  describe("button click", () => {
    it("should submit form when button is clicked", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "click test");

      await userEvent.click(screen.getByRole("button", { name: "button" }));

      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe("URL sync", () => {
    it("should update input when URL query changes", () => {
      const { rerender } = render(<SearchBar />);

      expect(screen.getByRole("textbox")).toHaveValue("");

      // Simulate URL change
      mockSearchParams = new URLSearchParams("q=new+value");
      rerender(<SearchBar />);

      expect(screen.getByRole("textbox")).toHaveValue("new value");
    });
  });

  describe("special characters", () => {
    it("should handle special characters in search", async () => {
      render(<SearchBar />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "C++ programming");

      fireEvent.submit(input.closest("form")!);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("C%2B%2B")
      );
    });
  });
});
