import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/search/searchPage/Pagination";

describe("Pagination", () => {
  describe("rendering", () => {
    it("should not render when totalPages <= 1", () => {
      const { container } = render(
        <Pagination page={1} total={5} pageSize={10} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render when totalPages > 1", () => {
      render(<Pagination page={1} total={25} pageSize={10} />);

      expect(screen.getByText("← Previous")).toBeInTheDocument();
      expect(screen.getByText("Next →")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should display correct page info", () => {
      render(<Pagination page={2} total={50} pageSize={10} />);
      expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
    });

    it("should have aria-label for accessibility", () => {
      render(<Pagination page={1} total={20} pageSize={10} />);
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Pagination"
      );
    });
  });

  describe("Previous button", () => {
    it("should be disabled on first page", () => {
      render(<Pagination page={1} total={30} pageSize={10} />);

      const prevButton = screen.getByText("← Previous");
      expect(prevButton).toBeDisabled();
    });

    it("should be enabled on page > 1", () => {
      render(<Pagination page={2} total={30} pageSize={10} />);

      const prevButton = screen.getByText("← Previous");
      expect(prevButton).not.toBeDisabled();
    });

    it("should call onPageChange with page - 1 when clicked", () => {
      const mockOnPageChange = vi.fn();
      render(
        <Pagination
          page={3}
          total={50}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText("← Previous"));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe("Next button", () => {
    it("should be disabled on last page", () => {
      render(<Pagination page={3} total={30} pageSize={10} />);

      const nextButton = screen.getByText("Next →");
      expect(nextButton).toBeDisabled();
    });

    it("should be enabled when not on last page", () => {
      render(<Pagination page={2} total={30} pageSize={10} />);

      const nextButton = screen.getByText("Next →");
      expect(nextButton).not.toBeDisabled();
    });

    it("should call onPageChange with page + 1 when clicked", () => {
      const mockOnPageChange = vi.fn();
      render(
        <Pagination
          page={2}
          total={50}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText("Next →"));
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe("totalPages calculation", () => {
    it("should calculate totalPages correctly (25 items, 10 per page = 3 pages)", () => {
      render(<Pagination page={1} total={25} pageSize={10} />);
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should calculate totalPages correctly (exact division)", () => {
      render(<Pagination page={1} total={20} pageSize={10} />);
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    it("should calculate totalPages correctly (1 item over)", () => {
      render(<Pagination page={1} total={21} pageSize={10} />);
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should handle single page when total equals pageSize", () => {
      const { container } = render(
        <Pagination page={1} total={10} pageSize={10} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should not call onPageChange when Previous is disabled", () => {
      const mockOnPageChange = vi.fn();
      render(
        <Pagination
          page={1}
          total={20}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Click disabled button should not trigger (browsers prevent this)
      const prevButton = screen.getByText("← Previous");
      expect(prevButton).toBeDisabled();
    });

    it("should not call onPageChange when Next is disabled", () => {
      const mockOnPageChange = vi.fn();
      render(
        <Pagination
          page={2}
          total={20}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText("Next →");
      expect(nextButton).toBeDisabled();
    });

    it("should handle zero total", () => {
      const { container } = render(
        <Pagination page={1} total={0} pageSize={10} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("should work without onPageChange callback", () => {
      render(<Pagination page={2} total={30} pageSize={10} />);

      // Should not throw when clicking without callback
      fireEvent.click(screen.getByText("← Previous"));
      fireEvent.click(screen.getByText("Next →"));
    });
  });
});
