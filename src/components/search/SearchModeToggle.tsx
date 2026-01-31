"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchMode } from "@/types/search";

type Props = {
  currentMode: SearchMode;
  translations: {
    modeBm25: string;
    modeHybrid: string;
    modeExact: string;
  };
};

export function SearchModeToggle({ currentMode, translations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const mode = value as SearchMode;
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "hybrid") {
      // hybrid is default, remove from URL
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }
    // Reset to page 1 when changing mode
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={currentMode} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="hybrid">{translations.modeHybrid}</TabsTrigger>
        <TabsTrigger value="bm25">{translations.modeBm25}</TabsTrigger>
        <TabsTrigger value="exact">{translations.modeExact}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
