const INTERNAL_API_BASE_ENV = "SEARCH_API_INTERNAL_BASE";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function getInternalApiBaseUrl(): string {
  const baseUrl = process.env[INTERNAL_API_BASE_ENV]?.trim();

  if (!baseUrl) {
    throw new Error(`${INTERNAL_API_BASE_ENV} is not configured`);
  }

  return normalizeBaseUrl(baseUrl);
}

export function buildInternalApiUrl(path: string, search = ""): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, getInternalApiBaseUrl());
  url.search = search;
  return url.toString();
}

export async function proxyToBackend(
  request: Request,
  {
    method,
    path,
  }: {
    method: "GET" | "POST";
    path: string;
  }
): Promise<Response> {
  let upstreamUrl: string;

  try {
    const requestUrl = new URL(request.url);
    upstreamUrl = buildInternalApiUrl(path, requestUrl.search);
  } catch (error) {
    return Response.json(
      {
        status: "error",
        error: {
          message: error instanceof Error ? error.message : "Invalid proxy configuration",
        },
      },
      { status: 500 }
    );
  }

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const bodyText = method === "POST" ? await request.text() : "";

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      cache: "no-store",
      ...(method === "POST" && bodyText ? { body: bodyText } : {}),
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");
    const cacheControl = upstreamResponse.headers.get("cache-control");

    responseHeaders.set("content-type", contentType ?? "application/json");
    if (cacheControl) {
      responseHeaders.set("cache-control", cacheControl);
    }
    // Do not forward content-encoding: fetch already decompresses the body,
    // so re-sending the header would cause the client to double-decompress.

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        error: {
          message: error instanceof Error ? error.message : "Failed to reach backend service",
        },
      },
      { status: 502 }
    );
  }
}
