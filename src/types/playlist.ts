/**
 * 歌单对象
 */
export interface IPlayList {
  _id: string;
  playlist: IPlaylistDetail;
}

export interface ITrack {
  album: string;
  artists: string;
  id: string;
  name: string;
  picUrl: string;
}

export interface IPlaylistDetail {
  coverImgUrl: string;
  creator: string;
  description: string | null;
  id: number | string;
  name: string;
  trackCount: number;
  tracks: ITrack[];
}

/**
 * 最终返回的网易云音乐对象 包含了源播放地址
 */
export interface musicType {
  id: string;
  // 歌曲名称
  name: string;
  // 作者
  ar_name: string;
  // 歌曲清晰度等级
  level: string;
  // 歌词
  lyric: string;
  // 专辑名称
  al_name: string;
  // 图片地址
  pic: string;
  // 歌曲地址
  url: string;
  // 歌曲大小
  size: string;
  // 状态码
  status: number;
  // 未知
  tlyric: string;
}
