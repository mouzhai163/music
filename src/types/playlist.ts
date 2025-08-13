import type { Song } from "@/types/album";

/**
 * 与歌单返回结构对齐的用户资料（精简版）
 */
export interface AvatarDetail {
  userType?: number;
  identityLevel?: number;
  identityIconUrl?: string;
}

export interface UserProfileLite {
  defaultAvatar: boolean;
  province: number;
  authStatus: number;
  followed: boolean;
  avatarUrl: string;
  accountStatus: number;
  gender: number;
  city: number;
  birthday: number;
  userId: number;
  userType: number;
  nickname: string;
  signature: string;
  description: string;
  detailDescription: string;
  avatarImgId: number;
  backgroundImgId: number;
  backgroundUrl: string;
  authority: number;
  mutual: boolean;
  expertTags: string[] | null;
  experts: Record<string, unknown> | null;
  djStatus: number;
  vipType: number;
  remarkName: string | null;
  authenticationTypes: number;
  avatarDetail: AvatarDetail | null;
  avatarImgIdStr: string;
  backgroundImgIdStr: string;
  anchor: boolean;
  avatarImgId_str?: string;
}

/**
 * 歌单对象（与 JSON 字段保持一致）
 */
export interface Playlist {
  id: number;
  name: string;
  coverImgId: number;
  coverImgUrl: string;
  coverImgId_str: string;
  adType: number;
  userId: number;
  createTime: number;
  status: number;
  opRecommend: boolean;
  highQuality: boolean;
  newImported: boolean;
  updateTime: number;
  trackCount: number;
  specialType: number;
  privacy: number;
  trackUpdateTime: number;
  commentThreadId: string;
  playCount: number;
  trackNumberUpdateTime: number;
  subscribedCount: number;
  cloudTrackCount: number;
  ordered: boolean;
  description: string;
  tags: string[];
  updateFrequency: string | null;
  backgroundCoverId: number;
  backgroundCoverUrl: string | null;
  titleImage: number;
  titleImageUrl: string | null;
  detailPageTitle: string | null;
  englishTitle: string | null;
  officialPlaylistType: string | null;
  copied: boolean;
  relateResType: string | null;
  coverStatus: number;
  subscribers: UserProfileLite[];
  subscribed: boolean | null;
  creator: UserProfileLite;
  tracks: Song[];
}

/**
 * 歌单详情响应体（常见还会包含 privileges、code 等字段）
 */
export interface PlaylistDetailResponse {
  playlist: Playlist;
  privileges?: unknown[];
  code?: number;
}
