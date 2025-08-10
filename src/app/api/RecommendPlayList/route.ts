import { getRecommend_playlist } from "../../../lib/dao/playlist.dao";
import { NextResponse } from "next/server";

/**
 * 首页推荐歌单
 * @returns
 */
export async function GET() {
  const today_recommendation = await getRecommend_playlist();
  if (today_recommendation) {
    return NextResponse.json({
      code: 200,
      data: today_recommendation,
    });
  }
  return NextResponse.json({
    code: -1,
    data: [],
  });
}
