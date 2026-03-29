"use client";

import { useTranslations } from "next-intl";

type Props = {
  warnings: string[];
};

export function SearchWarningBanner({ warnings }: Props) {
  const t = useTranslations("search");

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900"
    >
      <p className="font-medium">{t("degradedWarningTitle")}</p>
      <p className="text-sm text-amber-800">
        {t("degradedWarningDescription")}
      </p>
    </div>
  );
}
