/**
 * 专辑相关类型定义
 * 字段名保持与接口返回一致，便于直接映射
 */

export interface AlbumArtist {
  id: number;
  name: string;
  picId: number;
  img1v1Id: number;
  briefDesc: string;
  picUrl: string;
  img1v1Url: string;
  albumSize: number;
  alias: string[];
  trans: string;
  musicSize: number;
  topicPerson: number;
  picId_str?: string;
}

export interface Album {
  id: number;
  name: string;
  type: string; // 如："专辑"
  size: number; // 曲目数量
  picId: number;
  blurPicUrl: string;
  companyId: number;
  pic: number;
  picUrl: string;
  publishTime: number; // 时间戳（ms）
  description: string;
  tags: string;
  company: string;
  briefDesc: string;
  artist: AlbumArtist; // 主艺术家
  songs: unknown[]; // 有些响应里此字段为空数组，可按需换成自定义 Song 类型
  alias: string[];
  status: number;
  copyrightId: number;
  commentThreadId: string;
  artists: AlbumArtist[]; // 参与艺术家列表
  subType: string | null;
  transName: string | null;
  onSale: boolean;
  mark: number;
  gapless: number;
  dolbyMark: number;
  picId_str: string;
  locked: boolean;
}

export interface SongArtistLight {
  id: number;
  name: string;
  tns: string[];
  alias: string[];
}

export interface SongAlbumBrief {
  id: number;
  name: string;
  picUrl: string;
  tns: string[];
  pic_str?: string;
  pic: number;
}

export interface AudioQuality {
  br: number; // 比特率
  fid: number;
  size: number; // 文件大小（字节）
  vd: number; // 音量/响度相关，具体语义以服务端为准
  sr: number; // 采样率
}

export interface Song {
  name: string;
  mainTitle: string | null;
  additionalTitle: string | null;
  id: number;
  pst: number;
  t: number;
  ar: SongArtistLight[]; // 艺术家（简）
  alia: string[];
  pop: number;
  st: number;
  rt: string;
  fee: number;
  v: number;
  crbt: string | null;
  cf: string;
  al: SongAlbumBrief; // 所属专辑（简）
  dt: number; // 时长（毫秒）
  h?: AudioQuality | null;
  m?: AudioQuality | null;
  l?: AudioQuality | null;
  sq?: AudioQuality | null;
  hr?: AudioQuality | null;
  a: unknown | null;
  cd: string;
  no: number;
  rtUrl: string | null;
  ftype: number;
  rtUrls: string[];
  djId: number;
  copyright: number;
  s_id: number;
  mark: number;
  originCoverType: number;
  originSongSimpleData: unknown | null;
  tagPicList: unknown | null;
  resourceState: boolean;
  version: number;
  songJumpInfo: unknown | null;
  entertainmentTags: unknown | null;
  awardTags: unknown | null;
  displayTags: unknown | null;
  single: number;
  noCopyrightRcmd: unknown | null;
  mv: number;
  rtype: number;
  rurl: string | null;
  mst: number;
  cp: number;
  publishTime: number;
}

export interface AlbumInfo {
  resourceType: number;
  commentCount: number;
  likedCount: number;
  shareCount: number;
  threadId: string;
}

export interface AlbumDetailResponse {
  info: AlbumInfo;
  songs: Song[];
  album: Album;
}
