import { proxyToBackend } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  return proxyToBackend(request, {
    method: "POST",
    path: "/search/episodes",
  });
}
