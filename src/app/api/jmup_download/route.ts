import { NextRequest } from "next/server";
export const runtime = "nodejs";

// 仅允许 *.music.126.net，避免被当成开放跳转器
const ALLOWED_SUFFIX = ".music.126.net";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) return new Response("Missing url", { status: 400 });

  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (
    !(u.protocol === "http:" || u.protocol === "https:") ||
    !u.hostname.endsWith(ALLOWED_SUFFIX)
  ) {
    return new Response("Host not allowed", { status: 403 });
  }

  // 302/307 都行；307 会保留方法
  return new Response(null, {
    status: 302,
    headers: { Location: u.toString() },
  });
}
