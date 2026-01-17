"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function CopyableTitle({ title, children, className }: Props) {
  const t = useTranslations("common");

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(title);
      toast.success(t("copySuccess"));
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = title;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(t("copySuccess"));
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:opacity-70 transition-opacity ${className ?? ""}`}
      title={t("clickToCopy")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {children}
    </span>
  );
}
