import { searchSingerName } from "@/lib/utils/MusicUtils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {keyword, limit} = body

    if (!keyword) {
      return NextResponse.json({ error: "缺少参数 keyword" }, { status: 400 });
    }

    const parsedLimit = limit !== null ? Number(limit) : undefined;
    const opts =
      Number.isFinite(parsedLimit) && (parsedLimit as number) > 0
        ? { limit: parsedLimit as number, offset: 0 }
        : undefined;

    const data = await searchSingerName(
      keyword,
      process.env.COOKIE || "",
      opts
    );

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
