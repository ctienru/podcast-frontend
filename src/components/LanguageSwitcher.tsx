"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  locale: string;
};

export function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname();
  const t = useTranslations("language");

  return (
    <div className="text-sm text-muted-foreground flex gap-2">
      <Link
        href={pathname}
        locale="en"
        className={locale === "en" ? "font-bold" : "hover:underline"}
      >
        {t("en")}
      </Link>
      <span>|</span>
      <Link
        href={pathname}
        locale="zh"
        className={locale === "zh" ? "font-bold" : "hover:underline"}
      >
        {t("zh")}
      </Link>
    </div>
  );
}
