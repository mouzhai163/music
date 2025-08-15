import { complexSearch } from "@/lib/utils/MusicUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keyword = body.keyword?.trim();

    if (!keyword) {
      return NextResponse.json(
        { code: -1, error: "缺少搜索关键词" },
        { status: 400 }
      );
    }

    const data = await complexSearch(keyword, process.env.COOKIE);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /search] 错误:", error);
    return NextResponse.json(
      { code: -1, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
