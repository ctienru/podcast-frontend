"use client";

import { LangFilter } from "@/types/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: LangFilter;
  onChange: (value: LangFilter) => void;
  translations: {
    language: string;
    languageHelp: string;
    langZhTw: string;
    langZhCn: string;
    langEn: string;
    langZhBoth: string;
  };
};

export function LanguageFilterSection({ value, onChange, translations }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">{translations.language}</h3>
        <p className="text-sm text-muted-foreground">
          {translations.languageHelp}
        </p>
      </div>
      <Select value={value} onValueChange={(v) => onChange(v as LangFilter)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{translations.langEn}</SelectItem>
          <SelectItem value="zh-cn">{translations.langZhCn}</SelectItem>
          <SelectItem value="zh-tw">{translations.langZhTw}</SelectItem>
          {/* TODO: Remove zh-both support after backend refactoring */}
          {/* <SelectItem value="zh-both">{translations.langZhBoth}</SelectItem> */}
        </SelectContent>
      </Select>
    </div>
  );
}
