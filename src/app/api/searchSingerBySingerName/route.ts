import { searchSingerBySingerName, searchSingerName } from "@/lib/utils/MusicUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {keyword} = body

  if (!keyword) {
    return NextResponse.json({ error: "缺少参数 keyword" }, { status: 400 });
  }

  const data = await searchSingerBySingerName(keyword, process.env.COOKIE || "");

  return NextResponse.json({data});
}
