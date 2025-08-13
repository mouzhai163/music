import { getAlbumsById } from "@/lib/utils/MusicUtils";
import { NextResponse } from "next/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  try {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "body 解析失败" }, { status: 400 });
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "请求体需为 JSON 对象" },
        { status: 400 }
      );
    }

    const rawId = body["id"];
    const id =
      typeof rawId === "string"
        ? rawId
        : typeof rawId === "number"
        ? String(rawId)
        : "";

    if (!id) {
      return NextResponse.json({ error: "缺少参数 id" }, { status: 400 });
    }

    const data = await getAlbumsById(id, process.env.COOKIE || "");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
