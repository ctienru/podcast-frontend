import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchModeToggle } from "@/components/search/SearchModeToggle";

// Mock next/navigation at module level
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams("q=test"),
}));

describe("SearchModeToggle", () => {
  const translations = {
    modeHybrid: "Smart",
    modeBm25: "Keyword",
    modeExact: "Exact",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all mode options", () => {
    render(
      <SearchModeToggle currentMode="hybrid" translations={translations} />
    );

    expect(screen.getByText("Smart")).toBeInTheDocument();
    expect(screen.getByText("Keyword")).toBeInTheDocument();
    expect(screen.getByText("Exact")).toBeInTheDocument();
  });

  it("should highlight hybrid mode when current", () => {
    render(
      <SearchModeToggle currentMode="hybrid" translations={translations} />
    );

    const hybridTab = screen.getByRole("tab", { name: "Smart" });
    expect(hybridTab).toHaveAttribute("data-state", "active");
  });

  it("should highlight exact mode when current", () => {
    render(
      <SearchModeToggle currentMode="exact" translations={translations} />
    );

    const exactTab = screen.getByRole("tab", { name: "Exact" });
    expect(exactTab).toHaveAttribute("data-state", "active");
  });

  it("should highlight bm25 mode when current", () => {
    render(
      <SearchModeToggle currentMode="bm25" translations={translations} />
    );

    const bm25Tab = screen.getByRole("tab", { name: "Keyword" });
    expect(bm25Tab).toHaveAttribute("data-state", "active");
  });

  it("should render three tab triggers", () => {
    render(
      <SearchModeToggle currentMode="hybrid" translations={translations} />
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("should have correct tab order (hybrid, bm25, exact)", () => {
    render(
      <SearchModeToggle currentMode="hybrid" translations={translations} />
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveTextContent("Smart");
    expect(tabs[1]).toHaveTextContent("Keyword");
    expect(tabs[2]).toHaveTextContent("Exact");
  });
});
