import { describe, test, expect } from "vitest";
import { getLangFilter, getLanguageArray } from "@/app/[locale]/search/utils";
import type { LangFilter } from "@/types/search";

describe("getLangFilter", () => {
  describe("known v2 values — direct mapping", () => {
    test.each([
      ["zh-tw",   "zh-TW", "zh-tw"],
      ["zh-cn",   "zh-TW", "zh-cn"],
      ["en",      "en",    "en"],
      ["zh-both", "zh-TW", "zh-both"],
    ] as [string, string, LangFilter][])(
      "langParam=%s, locale=%s → %s",
      (langParam, locale, expected) => {
        expect(getLangFilter(langParam, locale)).toBe(expected);
      }
    );
  });

  describe("backward compatibility — legacy bookmarks", () => {
    test("lang=zh → zh-tw", () => {
      expect(getLangFilter("zh", "en")).toBe("zh-tw");
    });

    test("lang=hybrid → locale default", () => {
      expect(getLangFilter("hybrid", "zh-TW")).toBe("zh-tw");
      expect(getLangFilter("hybrid", "zh-CN")).toBe("zh-cn");
      expect(getLangFilter("hybrid", "en")).toBe("en");
    });
  });

  describe("locale-aware default", () => {
    test("no langParam, locale=zh-TW → zh-tw", () => {
      expect(getLangFilter(undefined, "zh-TW")).toBe("zh-tw");
    });

    test("no langParam, locale=zh-CN → zh-cn", () => {
      expect(getLangFilter(undefined, "zh-CN")).toBe("zh-cn");
    });

    test("no langParam, locale=en → en", () => {
      expect(getLangFilter(undefined, "en")).toBe("en");
    });

    test("unknown langParam falls back to locale default", () => {
      expect(getLangFilter("unknown-lang", "zh-TW")).toBe("zh-tw");
      expect(getLangFilter("unknown-lang", "zh-CN")).toBe("zh-cn");
      expect(getLangFilter("unknown-lang", "en")).toBe("en");
    });
  });
});

describe("getLanguageArray", () => {
  test.each([
    ["en",      ["en"]],
    ["zh-tw",   ["zh-tw"]],
    ["zh-cn",   ["zh-cn"]],
    ["zh-both", ["zh-tw", "zh-cn"]],
  ] as [LangFilter, string[]][])(
    "langFilter=%s → %s",
    (langFilter, expected) => {
      expect(getLanguageArray(langFilter)).toEqual(expected);
    }
  );
});
