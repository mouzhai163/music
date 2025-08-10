import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(resquest: NextRequest) {
  const id = resquest.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ code: -1, msg: "缺少参数id" });
  const level = process.env.level;
  const res = await axios.get(
    "http://127.0.0.1:5000/Song_V1?url=" + id + "&level=" + level + "&type=json"
  );
  const data = res.data;
  if (data.status === 200) {
    return NextResponse.json({
      code: 200,
      msg: "获取成功!",
      data: data,
    });
  } else {
    return NextResponse.json({
      code: -1,
      msg: "获取失败!",
      data: null,
    });
  }
}
