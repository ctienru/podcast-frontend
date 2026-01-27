"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type LangFilter = "en" | "zh" | "hybrid";

type Props = {
  currentLang: LangFilter;
  translations: {
    langEn: string;
    langZh: string;
    langHybrid: string;
  };
};

export function SearchLangToggle({ currentLang, translations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const lang = value as LangFilter;
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", lang);
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={currentLang} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="en">{translations.langEn}</TabsTrigger>
        <TabsTrigger value="zh">{translations.langZh}</TabsTrigger>
        <TabsTrigger value="hybrid">{translations.langHybrid}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
