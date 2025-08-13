import { getSongById } from "@/lib/utils/MusicUtils";
import { NextResponse } from "next/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
/**
 *
 * @param request
 * @returns
 */
export async function POST(request: Request) {
  try {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { code: -1, error: "body 解析失败" },
        { status: 400 }
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { code: -1, error: "请求体需为 JSON 对象" },
        { status: 400 }
      );
    }

    const rawId = body["id"];
    const level = body["level"];
    const id =
      typeof rawId === "string"
        ? rawId
        : typeof rawId === "number"
        ? String(rawId)
        : "";

    if (!id) {
      return NextResponse.json(
        { code: -1, error: "缺少参数 id" },
        { status: 400 }
      );
    }
    if (!level) {
      return NextResponse.json(
        { code: -1, error: "缺少参数 level" },
        { status: 400 }
      );
    }

    // 检查 level 是否为允许的类型
    const validLevels = [
      "standard",
      "exhigh",
      "lossless",
      "hires",
      "jyeffect",
      "sky",
      "jymaster",
    ];
    if (typeof level !== "string" || !validLevels.includes(level)) {
      return NextResponse.json({ error: "参数 level 不合法" }, { status: 400 });
    }

    const data = await getSongById(
      [id],
      level as
        | "standard"
        | "exhigh"
        | "lossless"
        | "hires"
        | "jyeffect"
        | "sky"
        | "jymaster",
      process.env.COOKIE || ""
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
