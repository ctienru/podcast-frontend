import { headers } from "next/headers";

type HeaderReader = {
  get(name: string): string | null;
};

function getFirstForwardedValue(value: string | null): string | null {
  if (!value) return null;

  const firstValue = value.split(",")[0]?.trim();
  return firstValue || null;
}

export function getRequestOrigin(headersList: HeaderReader): string {
  const forwardedProto = getFirstForwardedValue(headersList.get("x-forwarded-proto"));
  const forwardedHost = getFirstForwardedValue(headersList.get("x-forwarded-host"));
  const host = forwardedHost ?? headersList.get("host");

  if (host) {
    return `${forwardedProto ?? "http"}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function getRequestOriginFromCurrentRequest(): Promise<string> {
  try {
    return getRequestOrigin(await headers());
  } catch {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }
}
