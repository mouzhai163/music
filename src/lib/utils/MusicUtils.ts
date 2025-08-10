import axios from "axios";
import { ITrack, musicType } from "../../types/playlist";

/**
 *通过歌曲ID获取歌曲相关信息
 * @param id 歌曲ID
 * @param level 歌曲品质,不存在就默认从配置中获取
 */
export async function getSongById(
  id: string,
  level: string = "standard"
): Promise<musicType | null> {
  try {
    const { data } = await axios.get(
      `http://127.0.0.1:5000/Song_V1?url=${id}&level=${level}&type=json`
    );
    return data?.status === 200 ? (data as musicType) : null;
  } catch {
    return null;
  }
}
