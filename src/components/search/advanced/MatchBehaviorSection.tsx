"use client";

import { SearchMode } from "@/types/search";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Props = {
  value: SearchMode;
  onChange: (value: SearchMode) => void;
  translations: {
    matchBehavior: string;
    matchBehaviorHelp: string;
    matchSmartRecommended: string;
    matchSmartDesc: string;
    matchKeyword: string;
    matchKeywordDesc: string;
    matchExact: string;
    matchExactDesc: string;
  };
};

export function MatchBehaviorSection({ value, onChange, translations }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">{translations.matchBehavior}</h3>
        <p className="text-sm text-muted-foreground">
          {translations.matchBehaviorHelp}
        </p>
      </div>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as SearchMode)}>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="hybrid" id="mode-hybrid" className="mt-0.5" />
            <Label htmlFor="mode-hybrid" className="flex-1 cursor-pointer space-y-1">
              <div className="font-medium">{translations.matchSmartRecommended}</div>
              <div className="text-sm text-muted-foreground">
                {translations.matchSmartDesc}
              </div>
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="bm25" id="mode-bm25" className="mt-0.5" />
            <Label htmlFor="mode-bm25" className="flex-1 cursor-pointer space-y-1">
              <div className="font-medium">{translations.matchKeyword}</div>
              <div className="text-sm text-muted-foreground">
                {translations.matchKeywordDesc}
              </div>
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="exact" id="mode-exact" className="mt-0.5" />
            <Label htmlFor="mode-exact" className="flex-1 cursor-pointer space-y-1">
              <div className="font-medium">{translations.matchExact}</div>
              <div className="text-sm text-muted-foreground">
                {translations.matchExactDesc}
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
