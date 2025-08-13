import { callEapi, getCacheKey } from "./neteaseParse";

/**
 * 通过ID查询专辑信息
 * @argument id 专辑ID
 * @argument cookie 账号cookie
 * @returns
 */
export async function getAlbumsById(id: string, cookie = "") {
  const data: Record<string, unknown> = {
    id: id,
    cache_key: getCacheKey({ id: id, e_r: true }),
    e_r: "true",
    header: "{}",
  };
  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: "/eapi/album/v3/detail",
    apiPath: "/api/album/v3/detail", // 签名必须是 /api/...
    data,
    cookie,
  });
}

/**
 * 通过ID查询歌单信息
 * @argument id 歌单ID
 * @argument cookie 账号cookie
 * @returns
 */
export async function getPlaylistById(id: string, cookie = "") {
  const data: Record<string, unknown> = {
    id: id,
    // 生成CacheKey  需要传递这么多参数  密钥是一致的
    cache_key: getCacheKey({ id: id, e_r: "true", n: "1000", s: "5" }),
    e_r: "true",
    n: "1000",
    s: "5",
  };
  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: "/eapi/playlist/v4/detail",
    apiPath: "/api/playlist/v4/detail", // 签名必须是 /api/...
    data,
    cookie,
  });
}
/**
 * 备用 - 通过ID查询歌单信息
 * 这接口我他妈自己都不知道是从哪里扒 GPT六百六十六啊
 * @argument id 歌单ID
 * @argument cookie 账号cookie
 * @returns 返回result
 */
// export async function getPlaylistById(
//   id: number | string,
//   cookie: string,
//   options?: {
//     n?: number;
//     s?: number;
//   }
// ) {
//   const { n = 1000, s = 8 } = options || {};
//   const data: Record<string, unknown> = { id, n, s };
//   return callEapi({
//     hostname: "interface3.music.163.com",
//     eapiPath: "/eapi/playlist/detail",
//     query: `?id=${id}`,
//     apiPath: "/api/playlist/detail",
//     data,
//     cookie: cookie,
//   });
// }

/**
 *搜索歌手名返回歌手歌单
 * @param keyword 歌手名
 * @param cookie 账号cookie
 * @param opts limit 返回多少个参数 默认为10
 * @returns
 */
export async function searchSingerName(
  keyword: string,
  cookie: string,
  opts?: {
    limit?: number;
  }
) {
  const { limit = 10 } = opts || {};

  const data: Record<string, unknown> = {
    keyword,
    limit,
    scene: "normal",
  };

  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: "/eapi/search/song/list/page",
    apiPath: "/api/search/song/list/page",
    data,
    cookie,
  });
}

/**
 *
 */
export async function getSongById(
  ids: Array<string | number>, // 传裸 id 或 "id_0" 均可，函数里统一处理
  level:
    | "standard" //标准音质
    | "exhigh" //极高音质
    | "lossless" //无损音质
    | "hires" //Hi-Res音质
    | "jyeffect" //高清环绕声
    | "sky" //沉浸环绕声
    | "jymaster", //超清母带
  cookie = ""
) {
  // ids 按接口习惯需要形如 ["1449406576_0"] 的字符串
  const idsNorm = ids.map((x) => {
    const s = String(x);
    return /_\d+$/.test(s) ? s : `${s}_0`;
  });

  const data: Record<string, unknown> = {
    // 这些字段服务端期望是字符串（即使语义是数组/对象/布尔/数字）
    ids: JSON.stringify(idsNorm),
    level, // 这个可以是纯字符串
    encodeType: "flac", // 同上
  };

  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: "/eapi/song/enhance/player/url/v1",
    apiPath: "/api/song/enhance/player/url/v1",
    data,
    cookie,
  });
}
