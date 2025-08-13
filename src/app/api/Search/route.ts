import { searchSingerName } from "@/lib/utils/MusicUtils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const keywords = url.searchParams.get("keywords")?.trim();
    const limitStr = url.searchParams.get("limit");

    if (!keywords) {
      return NextResponse.json({ error: "缺少参数 keywords" }, { status: 400 });
    }

    const parsedLimit = limitStr !== null ? Number(limitStr) : undefined;
    const opts =
      Number.isFinite(parsedLimit) && (parsedLimit as number) > 0
        ? { limit: parsedLimit as number }
        : undefined;

    const data = await searchSingerName(
      keywords,
      process.env.COOKIE || "",
      opts
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
