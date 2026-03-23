import { describe, it, expect } from "vitest";
import { buildClickLogPayload } from "@/lib/analytics";

const baseInput = {
  requestId: "req-123",
  query: "人工智慧",
  selectedLang: "zh-tw" as const,
  episode: { episodeId: "ep:apple:123:ep1", language: "zh-tw" },
  rank: 2,
  searchResultTimestamp: 1000,
  clickTimestamp: 6000,
};

describe("buildClickLogPayload", () => {
  it("timeToClickSec 正確計算（無條件捨去至整數秒）", () => {
    const payload = buildClickLogPayload(baseInput);
    expect(payload.timeToClickSec).toBe(5); // (6000 - 1000) / 1000
  });

  it("clickedRank 是 1-indexed", () => {
    const payload = buildClickLogPayload({ ...baseInput, rank: 1 });
    expect(payload.clickedRank).toBe(1);
  });

  it("timestamp 是 ISO 8601 格式", () => {
    const payload = buildClickLogPayload(baseInput);
    expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("timestamp 對應 clickTimestamp", () => {
    const payload = buildClickLogPayload({ ...baseInput, clickTimestamp: 0 });
    expect(payload.timestamp).toBe(new Date(0).toISOString());
  });

  it("所有欄位都被填入", () => {
    const payload = buildClickLogPayload(baseInput);
    expect(payload.requestId).toBe("req-123");
    expect(payload.query).toBe("人工智慧");
    expect(payload.selectedLang).toBe("zh-tw");
    expect(payload.clickedEpisodeId).toBe("ep:apple:123:ep1");
    expect(payload.clickedLanguage).toBe("zh-tw");
  });

  it("不同 lang 值都正確帶入", () => {
    const payload = buildClickLogPayload({ ...baseInput, selectedLang: "zh-both" });
    expect(payload.selectedLang).toBe("zh-both");
  });

  it("rank=5 → clickedRank=5", () => {
    const payload = buildClickLogPayload({ ...baseInput, rank: 5 });
    expect(payload.clickedRank).toBe(5);
  });
});
