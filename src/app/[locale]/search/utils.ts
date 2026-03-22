import { defaultLangForLocale } from "@/types/search";
import type { LangFilter } from "@/types/search";

/**
 * Converts the URL lang param into a LangFilter.
 *
 * Priority:
 * 1. Known v2 values — map directly
 * 2. Legacy v1 values — backward compatible (no throw, so old bookmarks still work)
 * 3. Unknown or missing value — fall back to locale default
 *
 * @param langParam - the lang query param from the URL
 * @param locale    - current UI locale ("zh" | "en")
 */
export function getLangFilter(
  langParam: string | undefined,
  locale: string
): LangFilter {
  // v2 known values
  if (langParam === "zh-tw")   return "zh-tw";
  if (langParam === "zh-cn")   return "zh-cn";
  if (langParam === "zh-both") return "zh-both";
  if (langParam === "en")      return "en";

  // v1 backward compatibility
  if (langParam === "zh")      return "zh-tw";
  if (langParam === "hybrid")  return defaultLangForLocale(locale as "zh" | "en");

  // unknown or missing — derive from locale
  return defaultLangForLocale(locale as "zh" | "en");
}

/**
 * Expands a LangFilter into a language array for UI display purposes.
 *
 * Note: not used for API requests. The API receives lang as a single string
 * (e.g. "zh-both") and handles index routing itself.
 * Use this when the UI needs to show which languages are being searched.
 */
export function getLanguageArray(langFilter: LangFilter): string[] {
  switch (langFilter) {
    case "en":      return ["en"];
    case "zh-tw":   return ["zh-tw"];
    case "zh-cn":   return ["zh-cn"];
    case "zh-both": return ["zh-tw", "zh-cn"];
  }
}
