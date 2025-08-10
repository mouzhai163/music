import { create } from "zustand";
import { ITrack } from "../../types/playlist";

export type PlayMode = "单曲" | "列表" | "循环" | "随机";

interface PlayStore {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  playMode: PlayMode;
  setPlayMode: (playMode: PlayMode) => void;
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  playList: ITrack[];
  setPlayList: (data: ITrack[]) => void;
  pushPlayList: (music: ITrack) => void;
  addSongToPlayList: (music: ITrack) => void;
  popPlayList: () => void;
  clearPlayList: () => void;
  currentMusic: ITrack | null;
  setCurrentMusic: (music: ITrack) => void;
  // 播放控制方法
  playNext: () => boolean; // 返回是否成功切换
  playPrevious: () => boolean; // 返回是否成功切换
  playRandom: () => boolean; // 随机播放
  getCurrentIndex: () => number; // 获取当前歌曲在播放列表中的索引
}

export const usePlayStore = create<PlayStore>((set, get) => ({
  // 是否播放
  playing: false,
  setPlaying: (playing: boolean) => set({ playing }),
  // 当前播放时间
  currentTime: 0,
  setCurrentTime: (currentTime: number) => set({ currentTime }),
  // 音乐总共时间
  duration: 0,
  setDuration: (duration: number) => set({ duration }),
  // 播放方式
  playMode: "列表",
  setPlayMode: (playMode: PlayMode) => set({ playMode }),
  // 音量
  volume: 1,
  setVolume: (volume: number) => set({ volume }),
  // 是否静音
  muted: false,
  setMuted: (muted: boolean) => set({ muted }),
  // 播放列表
  playList: [],
  setPlayList: (playList: ITrack[]) => set({ playList }),
  // 添加一首歌曲 并且开始播放当前歌曲
  pushPlayList: (music: ITrack) => {
    set((state) => {
      state.setCurrentMusic(music);
      return { playList: [...state.playList, music] };
    });
  },
  // 添加一首歌
  addSongToPlayList: (music: ITrack) => {
    set((state) => {
      return { playList: [...state.playList, music] };
    });
  },
  // 弹出一首歌曲
  popPlayList: () =>
    set((state) => ({ playList: state.playList.slice(0, -1) })),
  // 清除所有歌曲
  clearPlayList: () => set({ playList: [] }),
  // 当前播放的音乐
  currentMusic: null,
  setCurrentMusic: (music: ITrack) => set({ currentMusic: music }),

  // 获取当前播放歌曲在播放列表中的下标
  getCurrentIndex: () => {
    const state = get();
    if (!state.currentMusic || state.playList.length === 0) return -1;
    return state.playList.findIndex(
      (music: ITrack) => music.id === state.currentMusic?.id
    );
  },

  // 切换下一首歌
  playNext: () => {
    const state = get();
    // 播放方式  列表
    const { playMode, playList, getCurrentIndex } = state;

    if (playList.length === 0) return false;
    //获取当前音乐下标
    const currentIndex = getCurrentIndex();
    let nextIndex: number;

    if (currentIndex === -1) {
      nextIndex = 0;
      // 如果是最后一首
    } else if (currentIndex === playList.length - 1) {
      if (playMode === "循环") {
        nextIndex = 0; // 循环模式回到第一首
      } else {
        return false; // 列表模式下终止
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    const nextMusic = playList[nextIndex];
    console.log("下一首歌:" + nextMusic.name);
    if (nextMusic) {
      set({ currentMusic: nextMusic });
      return true;
    }
    return false;
  },

  // 切换上一首歌
  playPrevious: () => {
    const state = get();
    if (state.playList.length === 0) return false;

    const currentIndex = state.getCurrentIndex();
    let prevIndex: number;

    if (currentIndex === -1) {
      // 当前歌曲不在播放列表中，播放最后一首
      prevIndex = state.playList.length - 1;
    } else if (currentIndex === 0) {
      // 已经是第一首
      return false;
    } else {
      // 播放上一首
      prevIndex = currentIndex - 1;
    }

    const prevMusic = state.playList[prevIndex];
    if (prevMusic) {
      set({ currentMusic: prevMusic });
      return true;
    }
    return false;
  },

  // 随机播放
  playRandom: () => {
    const state = get();
    if (state.playList.length === 0) return false;
    if (state.playList.length === 1) return false; // 只有一首歌，无法随机

    const currentIndex = state.getCurrentIndex();
    let randomIndex: number;

    // 确保随机到的不是当前歌曲
    do {
      randomIndex = Math.floor(Math.random() * state.playList.length);
    } while (randomIndex === currentIndex && state.playList.length > 1);

    const randomMusic = state.playList[randomIndex];
    if (randomMusic) {
      set({ currentMusic: randomMusic });
      return true;
    }
    return false;
  },
}));
