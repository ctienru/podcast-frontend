import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  describe("basic usage", () => {
    it("should merge multiple class names", () => {
      const result = cn("foo", "bar", "baz");
      expect(result).toBe("foo bar baz");
    });

    it("should handle single class name", () => {
      const result = cn("single-class");
      expect(result).toBe("single-class");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });

  describe("conditional classes (clsx)", () => {
    it("should handle boolean conditions", () => {
      const result = cn("base", true && "included", false && "excluded");
      expect(result).toBe("base included");
    });

    it("should handle object syntax", () => {
      const result = cn("base", {
        active: true,
        disabled: false,
        visible: true,
      });
      expect(result).toBe("base active visible");
    });

    it("should handle array syntax", () => {
      const result = cn(["one", "two"], "three");
      expect(result).toBe("one two three");
    });

    it("should filter out falsy values", () => {
      const result = cn(
        "base",
        null,
        undefined,
        false,
        "",
        0,
        "valid"
      );
      expect(result).toBe("base valid");
    });
  });

  describe("tailwind-merge conflicts", () => {
    it("should resolve conflicting padding classes", () => {
      const result = cn("p-4", "p-2");
      expect(result).toBe("p-2");
    });

    it("should resolve conflicting margin classes", () => {
      const result = cn("m-4", "m-8");
      expect(result).toBe("m-8");
    });

    it("should resolve conflicting text color classes", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should resolve conflicting background classes", () => {
      const result = cn("bg-white", "bg-black");
      expect(result).toBe("bg-black");
    });

    it("should not merge non-conflicting classes", () => {
      const result = cn("p-4", "m-2", "text-sm");
      expect(result).toBe("p-4 m-2 text-sm");
    });

    it("should handle conflicting flex classes", () => {
      const result = cn("flex-row", "flex-col");
      expect(result).toBe("flex-col");
    });

    it("should handle arbitrary values", () => {
      const result = cn("w-[100px]", "w-[200px]");
      expect(result).toBe("w-[200px]");
    });
  });

  describe("complex scenarios", () => {
    it("should handle mixed conditional and tailwind merge", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn(
        "base-class",
        "p-4",
        isActive && "bg-blue-500",
        isDisabled && "opacity-50",
        "p-2" // should override p-4
      );

      expect(result).toBe("base-class bg-blue-500 p-2");
    });

    it("should work with typical component pattern", () => {
      const variant = "primary" as "primary" | "secondary";
      const className = "custom-class";

      const result = cn(
        "btn",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
        },
        className
      );

      expect(result).toBe("btn btn-primary custom-class");
    });
  });
});
