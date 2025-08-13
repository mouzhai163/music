import type { Song } from "@/types/album";
import type { FreeTrialPrivilege } from "@/types/song_url";

export interface SongChargeInfo {
  rate: number;
  chargeUrl: string | null;
  chargeMessage: string | null;
  chargeType: number;
}

export interface SongPrivilege {
  id: number;
  fee: number;
  payed: number;
  realPayed: number;
  st: number;
  pl: number;
  dl: number;
  sp: number;
  cp: number;
  subp: number;
  cs: boolean;
  maxbr: number;
  fl: number;
  pc: number | null;
  toast: boolean;
  flag: number;
  paidBigBang: boolean;
  preSell: boolean;
  playMaxbr: number;
  downloadMaxbr: number;
  maxBrLevel: string;
  playMaxBrLevel: string;
  downloadMaxBrLevel: string;
  plLevel: string;
  dlLevel: string;
  flLevel: string;
  rscl: number | null;
  freeTrialPrivilege: FreeTrialPrivilege;
  rightSource: number;
  chargeInfoList: SongChargeInfo[];
  code: number;
  message: string | null;
  plLevels: unknown | null;
  dlLevels: unknown | null;
  ignoreCache: unknown | null;
  bd: unknown | null;
}

export interface SimpleSongData extends Song {
  privilege: SongPrivilege;
}

export interface BaseInfo {
  simpleSongData: SimpleSongData;
  metaData: string[]; // 例如 ["VIP", "HiRes", "SQ"]
}

export interface AlgClickableTagItem {
  clickable: boolean;
  boardId: string | null;
  text: string;
  url: string | null;
  reasonId: string | null;
  reasonType: number | null;
  reasonTag: string | null;
  sceneTag: string | null;
  resourceId: string;
}

export interface ExtInfo {
  algClickableTags: AlgClickableTagItem[];
  songAlias: string;
  artistTns: string;
  lyrics: Record<string, unknown>;
  songCreator: unknown | null;
  memberGuidanceInfo: unknown | null;
  noCopyRight: boolean;
  hasNoCopyrightRcmd: boolean;
  noCopyrightRcmdStyle: number;
  payType: unknown | null;
  albumUrl: string | null;
  algAlbumName: string | null;
  resourceHotExplainDTO: unknown | null;
  showVideoTip: boolean;
  tsShowFlag: boolean;
  recommendText: string | null;
  officialTags: unknown | null;
  specialTags: string[];
  overrideTitle: string | null;
  overrideSubTitle: string | null;
  overrideImageType: string | null;
  overrideImageUrl: string | null;
}

export interface SearchResourceItem {
  resourceName: string; // 如："单曲"
  resourceType: string; // 如："song"
  resourceId: string; // 字符串形式的数字
  baseInfo: BaseInfo;
  extInfo: ExtInfo;
  relatedResources: unknown[];
  action: string; // 如："play_one_song"
  actionType: string; // 如："search_action_play"
  foldId: string; // 同 resourceId
  type: string; // 如："song"
  alg: string;
}

export interface SearchData {
  resources: SearchResourceItem[];
  totalCount: number;
  hasMore: boolean;
  searchQcReminder: unknown | null;
  hlWords: string[];
  tagSelectSongTagInfoDetails: unknown | null;
  noResultInfo: unknown | null;
}

export interface SearchResponse {
  code: number;
  data: SearchData;
  message: string;
}
