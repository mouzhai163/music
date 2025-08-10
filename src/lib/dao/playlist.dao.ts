import "server-only";
import { getDb } from "../db";

/**
 *
 * @returns 推荐歌单
 */
export async function getRecommend_playlist() {
  const db = await getDb();
  const Recommend_playlist = await db
    .collection("recommend_playlist")
    .find({})
    .toArray();
  return Recommend_playlist;
}
