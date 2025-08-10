import { getRecommend_Songs } from "../../../lib/dao/songs.dao";
import { NextResponse } from "next/server";
/**
 * 首页推荐歌曲
 * @returns
 */
export async function GET() {
  const recommend_songs = await getRecommend_Songs();
  if (recommend_songs) {
    return NextResponse.json({
      code: 200,
      data: recommend_songs,
    });
  }
  return NextResponse.json({
    code: -1,
    data: [],
  });
}
