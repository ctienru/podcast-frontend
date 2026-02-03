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
    langAny: string;
    langZhOnly: string;
    langEnOnly: string;
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
          <SelectItem value="hybrid">{translations.langAny}</SelectItem>
          <SelectItem value="zh">{translations.langZhOnly}</SelectItem>
          <SelectItem value="en">{translations.langEnOnly}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
