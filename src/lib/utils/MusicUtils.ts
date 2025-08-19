import { callEapi, getCacheKey } from "./neteaseParse";

/**
 * 通过ID查询指定专辑信息
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
    apiPath: "/api/album/v3/detail",
    data,
    cookie,
  });
}

/**
 * 通过ID查询指定歌单信息
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
    apiPath: "/api/playlist/v4/detail",
    data,
    cookie,
  });
}
/**
 * 备用 - 通过ID查询歌单信息
 * 这接口我他妈自己都不知道是从哪里扒 GPT六百六十六啊  但是可以用!!
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
 *搜索歌手名返回歌手歌曲
 * @param keyword 歌手名
 * @param cookie 账号cookie
 * @param opts limit 返回多少个参数 默认为20
 * @returns
 */
export async function searchSingerName(
  keyword: string,
  cookie: string,
  options?:{
    limit:number,
    offset:number
  }
) {
  const data: Record<string, unknown> = {
    keyword,
    // 接口默认只返回20条 可以通过offset偏移获取
    limit: options?.limit || 20,
    scene: "normal",
    offset: options?.offset,
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
 * 通过ID获取单曲
 *  @params: ids 歌曲ID
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


/**
 * 通过歌手ID查询指定歌手所有专辑
 * @param id 歌手ID
 * @param cookie 账号cookie
 * @returns
 */
export async function getAllAlbumsByArtistId(id: string, cookie = "") {
  const data: Record<string, unknown> = {
    limit:1000,
  };

  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: `/eapi/artist/albums/${id}`,
    apiPath: `/api/artist/albums/${id}`,
    data,
    cookie,
  });
}


/**
 * 通过歌手名查询指定歌手专辑
 * @param id 歌手ID
 * @param cookie 账号cookie
 * @returns 返回50条专辑 可以通过offsite偏移获取新数据
 */
export async function getAllAlbumsBySingerName(keyword: string, cookie = "") {
  const data: Record<string, unknown> = {
    s:keyword,
    limit: '50',
  };

  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: `/eapi/v1/search/album/get`,
    apiPath: `/api/v1/search/album/get`,
    data,
    cookie,
  });
}

/**
 * 通过歌手ID查询歌手所有歌曲 好像最多就返回200条歌曲
 * @param id 歌手ID
 * @param cookie 
 * @returns 
 */
export async function getAllSongsByArtistId(id: string, cookie = "") {
  const data: Record<string, unknown> = {
    id,
    limit:1000,
    offset: '0',
    private_cloud: 'true',
  };
  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: `/eapi/v2/artist/songs`,
    apiPath: `/api/v2/artist/songs`,
    data,
    cookie,
  });
}


/**
 * 搜索歌手
 * @param id 歌手名
 * @param cookie 
 * @returns 
 */
export async function searchSingerBySingerName(id: string, cookie = "") {
  const data: Record<string, unknown> = {
    limit:20,
    s:id,
  };

  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: `/eapi/v1/search/artist/get`,
    apiPath: `/api/v1/search/artist/get`,
    data,
    cookie,
  });
}


/**
 * 综合搜索 适用于首页刚开始点击搜索功能
 * @param keyword 可以是歌手名 也可以是歌曲名
 */
export async function complexSearch(keyword: string, cookie = "") {
  const data: Record<string, unknown> = {
    keyword,
    channel: 'history',
    needCorrect: 'true',
    scene: 'normal',
  };
  return callEapi<unknown>({
    hostname: "interface3.music.163.com",
    eapiPath: "/eapi/search/complex/page/v3",
    apiPath: "/api/search/complex/page/v3",
    data,
    cookie,
  })
}