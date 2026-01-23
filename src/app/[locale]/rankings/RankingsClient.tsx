"use client";

import { useState } from "react";
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
import type { RankingsResult } from "@/types/search";

const PLACEHOLDER_IMAGE = "/placeholder-podcast.svg";

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

type Props = {
  initialRankings: RankingsResult | null;
  initialCountry: string;
  initialType: string;
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
  error,
  translations: t,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState(initialCountry);
  const [type, setType] = useState(initialType);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

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

  const items = initialRankings?.items ?? [];
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
            {t.updatedAt.replace("{time}", formatRelativeTime(updatedAt))}
          </span>
        )}
      </div>

      {/* Ranking list */}
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t.noResults}</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => {
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
                    <article className="flex gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element -- external images with onError fallback */}
                      <img
                        src={imgSrc}
                        alt={item.title ?? ""}
                        className="h-16 w-16 rounded-md object-cover shrink-0"
                        onError={() => handleImageError(itemKey)}
                      />
                      <div className="min-w-0 space-y-1">
                        <h2 className="font-semibold line-clamp-2">
                          <CopyableTitle title={item.title ?? ""}>
                            {item.title}
                          </CopyableTitle>
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.publisher}
                          {!isEpisodeRankings && item.episodeCount && (
                            <> · {item.episodeCount} {t.episodes}</>
                          )}
                        </p>
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
