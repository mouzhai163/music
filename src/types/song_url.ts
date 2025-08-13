/**
 * 歌曲播放地址结果类型（对齐 src/tmp/歌曲结果.json）
 */

export type SongLevelType =
  | "standard"
  | "exhigh"
  | "lossless"
  | "hires"
  | "jyeffect"
  | "sky"
  | "jymaster"
  | string;

export interface FreeTrialPrivilege {
  resConsumable: boolean;
  userConsumable: boolean;
  listenType: number | null;
  cannotListenReason: number | null;
  playReason: number | null;
  freeLimitTagType: number | null;
}

export interface FreeTimeTrialPrivilege {
  resConsumable: boolean;
  userConsumable: boolean;
  type: number;
  remainTime: number;
}

export interface SongType {
  id: number;
  url: string;
  br: number; // 比特率
  size: number; // 文件大小（字节）
  md5: string;
  code: number; // 200 表示可播放
  expi: number; // 过期时间（秒）
  type: string; // 格式，如 mp3/flac
  gain: number;
  peak: number;
  closedGain: number;
  closedPeak: number;
  fee: number;
  uf: unknown | null;
  payed: number;
  flag: number;
  canExtend: boolean;
  freeTrialInfo: unknown | null;
  level: SongLevelType;
  encodeType: string; // mp3/flac
  channelLayout: string | null;
  freeTrialPrivilege: FreeTrialPrivilege;
  freeTimeTrialPrivilege: FreeTimeTrialPrivilege;
  urlSource: number;
  rightSource: number;
  podcastCtrp: unknown | null;
  effectTypes: unknown | null;
  time: number; // 时长（毫秒）
  message: string | null;
  levelConfuse: unknown | null;
  musicId: string; // 注意：该字段在样例中为字符串
  accompany: unknown | null;
  sr: number; // 采样率
  auEff: unknown | null;
}

export interface SongDataType {
  data: SongType[];
  code: number;
}
