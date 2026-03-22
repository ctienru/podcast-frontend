import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

const REQUIRED_LANG_KEYS = ["langZhTw", "langZhCn", "langEn", "langZhBoth"] as const;
const REMOVED_LANG_KEYS = ["langAny", "langZhOnly", "langEnOnly"] as const;

describe("i18n lang keys — en.json search namespace", () => {
  it.each(REQUIRED_LANG_KEYS)("has required key: %s", (key) => {
    expect(en.search).toHaveProperty(key);
    expect((en.search as Record<string, string>)[key]).toBeTruthy();
  });

  it.each(REMOVED_LANG_KEYS)("removed legacy key: %s", (key) => {
    expect(en.search).not.toHaveProperty(key);
  });
});

describe("i18n lang keys — zh.json search namespace", () => {
  it.each(REQUIRED_LANG_KEYS)("has required key: %s", (key) => {
    expect(zh.search).toHaveProperty(key);
    expect((zh.search as Record<string, string>)[key]).toBeTruthy();
  });

  it.each(REMOVED_LANG_KEYS)("removed legacy key: %s", (key) => {
    expect(zh.search).not.toHaveProperty(key);
  });
});
