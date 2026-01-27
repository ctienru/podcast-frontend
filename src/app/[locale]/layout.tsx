import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavSearchBox } from "@/components/NavSearchBox";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    title: {
      default: `${t("title")} - ${t("tagline")}`,
      template: `%s | ${t("title")}`,
    },
    description: t("tagline"),
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: t("title"),
      description: t("tagline"),
      siteName: t("title"),
      locale: locale === "zh" ? "zh_TW" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("tagline"),
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        "zh-TW": `${baseUrl}/zh`,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("nav");
  const siteT = await getTranslations("site");

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Header */}
          <header className="border-b">
            <div className="mx-auto max-w-screen-md px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="font-semibold text-lg hover:opacity-80 transition-opacity"
                >
                  {siteT("title")}
                </Link>
                <nav className="flex items-center gap-4">
                  <Link
                    href="/rankings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("rankings")}
                  </Link>
                  <NavSearchBox placeholder={t("search")} />
                </nav>
              </div>

              <LanguageSwitcher locale={locale} />
            </div>
          </header>

          {/* Main */}
          <main className="mx-auto max-w-screen-md px-4 py-6">{children}</main>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}