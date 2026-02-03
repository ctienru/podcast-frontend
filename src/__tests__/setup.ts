import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  getTranslations: () => async (key: string) => key,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock @/i18n/navigation
vi.mock("@/i18n/navigation", async () => {
  const ActualReact = await vi.importActual<typeof import("react")>("react");
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
    }),
    usePathname: () => "/",
    Link: ({ children, ...props }: React.PropsWithChildren<{ href: string; locale?: string }>) => {
      return ActualReact.createElement("a", props, children);
    },
  };
});

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
});

// Mock window.location.reload
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    reload: vi.fn(),
  },
  writable: true,
});

// Mock PointerEvent methods for Radix UI
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = vi.fn();
}
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = vi.fn();
}
if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = vi.fn();
}

// Mock scrollIntoView for Radix UI Select
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}
