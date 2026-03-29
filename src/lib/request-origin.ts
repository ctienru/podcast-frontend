import { headers } from "next/headers";

export function getRequestOrigin(headersList: Headers): string {
  const forwardedProto = headersList.get("x-forwarded-proto");
  const forwardedHost = headersList.get("x-forwarded-host");
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
