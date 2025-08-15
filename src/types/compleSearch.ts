import { Song } from "./album";

export interface compleSearchType {
  code: number;
  data: compleSearchDataType;
}

export interface compleSearchDataType {
  blocks: blockDataType[];
}

export interface blockDataType {
  blockCode: string;
  resources: resourcesDataType[];
}

export interface resourcesDataType {
  blockCode: string;
  resourceName: string;
  resourceType: string;
  resourceId: string;
  baseInfo: {
    artistDTO?: {
      id: number;
      name: string;
      picUrl: string;
      musicSize: number;
      albumSize: number;
      briefDesc: string;
      alias: string[];
      img1v1Url: string;
    };
    simpleSongData?:Song
  };
  extInfo: {
    fansSize?: number;
  };
  type: string;
}
