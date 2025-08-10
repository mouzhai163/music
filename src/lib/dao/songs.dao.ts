import "server-only";
import { getDb } from "../db";

/**
 *
 * @returns 推荐歌曲
 */
export async function getRecommend_Songs() {
  const db = await getDb();
  const recommend_songs = await db
    .collection("recommend_songs")
    .find({})
    .toArray();
  return recommend_songs;
}
