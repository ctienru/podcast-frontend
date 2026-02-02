"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyableTitle } from "@/components/CopyableTitle";
import { batchGetShowDetailsFromApi } from "@/lib/search";
import type { RankingsResult, RankingsItemEnriched } from "@/types/search";

const PLACEHOLDER_IMAGE = "/placeholder-podcast.svg";

function formatRelativeTime(isoString?: string, locale?: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isZh = locale === "zh";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return isZh ? "剛剛" : "just now";
  if (minutes < 60) return isZh ? `${minutes} 分鐘前` : `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isZh ? `${hours} 小時前` : `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return isZh ? `${days} 天前` : `${days}d ago`;

  return date.toLocaleDateString(isZh ? "zh-TW" : "en-US");
}

type Props = {
  initialRankings: RankingsResult | null;
  initialCountry: string;
  initialType: string;
  locale: string;
  error: string | null;
  translations: {
    selectCountry: string;
    taiwan: string;
    unitedStates: string;
    podcast: string;
    episode: string;
    noResults: string;
    episodes: string;
    updatedAt: string;
  };
};

export function RankingsClient({
  initialRankings,
  initialCountry,
  initialType,
  locale,
  error,
  translations: t,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState(initialCountry);
  const [type, setType] = useState(initialType);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [enrichedItems, setEnrichedItems] = useState<RankingsItemEnriched[]>(
    initialRankings?.items ?? []
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Async load show details
  useEffect(() => {
    const items = initialRankings?.items ?? [];
    if (items.length === 0 || type === "episode") {
      setEnrichedItems(items);
      return;
    }

    // Extract show IDs
    const showIds = items
      .map((item) => item.showId)
      .filter((id): id is string => id != null);

    if (showIds.length === 0) {
      setEnrichedItems(items);
      return;
    }

    setIsLoadingDetails(true);

    // Batch fetch details
    batchGetShowDetailsFromApi(showIds)
      .then((details) => {
        const enriched = items.map((item) => ({
          ...item,
          detail: item.showId ? details[item.showId] : undefined,
        }));
        setEnrichedItems(enriched);
      })
      .catch((err) => {
        console.error("Failed to load show details:", err);
        setEnrichedItems(items); // Fallback to basic items
      })
      .finally(() => {
        setIsLoadingDetails(false);
      });
  }, [initialRankings, type]);

  const handleCountryChange = (value: string) => {
    setCountry(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("country", value);
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.push(`?${params.toString()}`);
  };

  const handleImageError = (showId: string) => {
    setImgErrors((prev) => new Set(prev).add(showId));
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const updatedAt = initialRankings?.updatedAt;
  const isEpisodeRankings = type === "episode";

  return (
    <>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.selectCountry} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tw">{t.taiwan}</SelectItem>
            <SelectItem value="us">{t.unitedStates}</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={type} onValueChange={handleTypeChange}>
          <TabsList>
            <TabsTrigger value="podcast">{t.podcast}</TabsTrigger>
            <TabsTrigger value="episode">{t.episode}</TabsTrigger>
          </TabsList>
        </Tabs>

        {updatedAt && (
          <span className="text-xs text-muted-foreground">
            {t.updatedAt.replace("__time__", formatRelativeTime(updatedAt, locale))}
          </span>
        )}
      </div>

      {/* Ranking list */}
      {enrichedItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t.noResults}</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {enrichedItems.map((item) => {
            const itemKey = item.showId || `rank-${item.rank}`;
            const imgSrc = imgErrors.has(itemKey)
              ? PLACEHOLDER_IMAGE
              : item.imageUrl || PLACEHOLDER_IMAGE;

            return (
              <li key={itemKey} className="flex gap-4 items-start">
                <div className="w-8 text-right text-2xl font-semibold text-muted-foreground">
                  {item.rank}
                </div>
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <article className="flex gap-4 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- external images with onError fallback */}
                      <img
                        src={imgSrc}
                        alt={item.title ?? ""}
                        className="h-32 w-32 rounded-md object-cover shrink-0"
                        onError={() => handleImageError(itemKey)}
                      />
                      <div className="min-w-0 space-y-1 flex-1">
                        <h2 className="font-semibold line-clamp-2">
                          <CopyableTitle title={item.title ?? ""}>
                            {item.title}
                          </CopyableTitle>
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.publisher}
                          {!isEpisodeRankings && (() => {
                            const count = item.detail?.episodeCount ?? item.episodeCount;
                            return count && count > 0 ? <> · {count} {t.episodes}</> : null;
                          })()}
                        </p>

                        {/* Categories */}
                        {item.detail?.categories && item.detail.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.detail.categories.slice(0, 3).map((cat, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {item.detail?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 pt-1">
                            {item.detail.description}
                          </p>
                        )}
                      </div>
                    </article>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
