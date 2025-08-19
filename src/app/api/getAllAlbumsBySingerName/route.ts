import { getAllAlbumsBySingerName } from "@/lib/utils/MusicUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keyword = body.keyword?.trim();
    if (!keyword) {
      return NextResponse.json({ error: "缺少参数 keyword" }, { status: 400 });
    }
    const res = await getAllAlbumsBySingerName(keyword, process.env.COOKIE);
    return NextResponse.json({data:res});
  } catch (error) {
    return NextResponse.json(
      { code: -1, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
