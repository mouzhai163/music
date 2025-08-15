import { Song } from "@/types/album";
import { create } from "zustand";
import { Howl } from "howler";
import { SongType } from "@/types/song_url";

export type PlayMode = "单曲" | "列表" | "循环" | "随机";

interface PlayStore {
  // 当前播放状态
  playing: boolean;
  setPlaying: (status: boolean) => void;
  // 当前播放时间
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  // 音乐时长
  duration: number;
  setDuration: (duration: number) => void;
  // 播放模式
  playMode: PlayMode;
  setPlayMode: (playMode: PlayMode) => void;
  // 音量
  volume: number;
  setVolume: (volume: number) => void;
  //静音状态
  muted: boolean;
  setMuted: (muted: boolean) => void;
  // 播放歌单
  playList: Song[];
  // 历史播放歌单
  playHistory: Song[];
  pushHistory: (music: Song) => void;
  setPlayList: (data: Song[]) => void;
  pushPlayList: (music: Song) => void;
  addSongToPlayList: (music: Song) => void;
  popPlayList: () => void;
  clearPlayList: () => void;
  currentMusic: Song | null;
  setCurrentMusic: (music: Song | null) => void;
  // 全局 Howler 实例
  howlInstance: Howl | null;
  setHowlInstance: (howl: Howl | null) => void;
  createHowlerInstance: (obj: SongType) => Howl;
  // 播放控制方法
  playNext: () => boolean; // 返回是否成功切换
  playPrevious: () => boolean; // 返回是否成功切换
  playRandom: () => boolean; // 随机播放
  getCurrentIndex: () => number; // 获取当前歌曲在播放列表中的索引
  seekTo: (time: number) => void; // 跳转到指定时间
  handleSongNext: () => void; // 处理下一首歌曲逻辑
  handleSongPrevious: () => boolean; // 处理上一首歌曲逻辑，返回是否成功
  handleSongPause: () => boolean; // 处理播放/暂停，返回是否成功
  handleTogglePlayMode: () => string; // 切换播放模式，返回提示消息
}

export const usePlayStore = create<PlayStore>((set, get) => ({
  // 全局 Howl 实例状态
  howlInstance: null,
  setHowlInstance: (howl: Howl | null) => set({ howlInstance: howl }),

  // 全局 howler 实例
  createHowlerInstance: (obj) => {
    let progressInterval: NodeJS.Timeout | null = null;

    const Howlobj = new Howl({
      src: [obj.url.split("?")[0]],
      html5: true,
      volume: get().volume,
      mute: get().muted,
      onload: () => set({ duration: Howlobj.duration() }),
      onplay: () => {
        Howlobj.fade(0, get().volume, 300);
        get().setPlaying(true);

        // 开始进度更新定时器
        progressInterval = setInterval(() => {
          const currentTime = Howlobj.seek() as number;
          get().setCurrentTime(currentTime);
        }, 100); // 每100ms更新一次进度
      },
      onpause: () => {
        get().setPlaying(false);
        // 暂停时清除进度更新定时器
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      },
      onstop: () => {
        get().setPlaying(false);
        // 停止时清除进度更新定时器并重置进度
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        get().setCurrentTime(0);
      },
      onend: () => {
        // 播放结束时清除定时器
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        get().setCurrentTime(0);

        // 根据播放模式自动切歌
        const state = get();
        switch (state.playMode) {
          case "单曲": {
            // 单曲循环：直接重新播放当前歌曲
            setTimeout(() => {
              if (Howlobj && state.currentMusic) {
                Howlobj.seek(0);
                Howlobj.play();
              }
            }, 100);
            break;
          }
          case "循环": {
            // 循环模式：到最后一首回到第一首；只有一首歌则重复当前
            setTimeout(() => {
              if (state.playList.length <= 1) {
                if (Howlobj && state.currentMusic) {
                  Howlobj.seek(0);
                  Howlobj.play();
                }
              } else {
                state.playNext();
              }
            }, 100);
            break;
          }
          case "列表": {
            // 列表模式：到列表末尾应停止
            setTimeout(() => {
              const advanced = state.playNext();
              if (!advanced) {
                set({ playing: false });
              }
            }, 100);
            break;
          }
          case "随机": {
            // 随机模式：随机选择下一首，若失败则停止
            setTimeout(() => {
              const ok = state.playRandom();
              if (!ok) {
                set({ playing: false });
              }
            }, 100);
            break;
          }
        }
      },
    });

    // 将 Howl 实例保存到 store 中
    get().setHowlInstance(Howlobj);

    Howlobj.play();
    return Howlobj;
  },
  // 当前播放状态
  playing: false,
  setPlaying: (status: boolean) => set({ playing: status }),
  // 当前播放的音乐
  currentMusic: null,
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
  // 播放历史
  playHistory: [],
  // 添加一首歌到播放历史
  pushHistory: (music: Song) => {
    set((state) => {
      return { playHistory: [...state.playHistory, music] };
    });
  },
  setPlayList: (playList: Song[]) => set({ playList }),
  // 添加一首歌曲 并且开始播放当前歌曲
  pushPlayList: (music: Song) => {
    set((state) => {
      state.setCurrentMusic(music);
      return { playList: [...state.playList, music] };
    });
  },

  // 添加一首歌
  addSongToPlayList: (music: Song) => {
    set((state) => {
      return { playList: [...state.playList, music] };
    });
  },
  // 弹出一首歌曲
  popPlayList: () =>
    set((state) => ({ playList: state.playList.slice(0, -1) })),
  // 清除所有歌曲
  clearPlayList: () => {
    set({
      playing: false,
      playList: [],
      currentMusic: null,
      currentTime: 0,
      duration: 0,
    });
  },

  setCurrentMusic: (music: Song | null) => {
    set((state) => {
      if (state.currentMusic) {
        state.pushHistory(state.currentMusic);
      }
      return { currentMusic: music };
    });
  },

  // 获取当前播放歌曲在播放列表中的下标
  getCurrentIndex: () => {
    const state = get();
    if (!state.currentMusic || state.playList.length === 0) return -1;
    return state.playList.findIndex(
      (music: Song) => music.id === state.currentMusic?.id
    );
  },

  // 切换下一首歌（使用 setCurrentMusic 以确保历史入栈）
  playNext: () => {
    const state = get();
    const { playMode, playList, getCurrentIndex } = state;
    // 1：判断是否还存在下一首歌
    if (playList.length === 0) return false;
    // 获取当前歌曲在播放列表里的第几位
    const currentIndex = getCurrentIndex();
    let nextIndex: number;

    if (currentIndex === -1) {
      nextIndex = 0;
    } else if (currentIndex === playList.length - 1) {
      // 2： 再判断模式
      if (playMode === "循环") {
        nextIndex = 0;
      } else {
        set({ playing: false });
        return false;
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    const nextMusic = playList[nextIndex];
    if (nextMusic) {
      set((s) => {
        s.setCurrentMusic(nextMusic);
        return {} as Partial<PlayStore>;
      });
      return true;
    }
    return false;
  },

  // 切换上一首歌：优先从历史栈回退，其次按列表索引回退
  playPrevious: () => {
    const state = get();
    const { playHistory } = state;

    // 1) 历史优先
    if (playHistory.length > 0) {
      const last = playHistory[playHistory.length - 1];
      set({ currentMusic: last, playHistory: playHistory.slice(0, -1) });
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
      state.setCurrentMusic(randomMusic);
      return true;
    }
    return false;
  },

  // 跳转到指定时间
  seekTo: (time: number) => {
    const state = get();
    if (time >= 0 && time <= state.duration) {
      state.setCurrentTime(time);
    }
  },

  // 处理下一首歌曲逻辑
  handleSongNext: () => {
    const state = get();
    switch (state.playMode) {
      case "单曲":
        // 单曲循环：重新播放当前歌曲
        if (state.howlInstance) {
          state.howlInstance.seek(0);
          state.howlInstance.play();
        }
        break;
      case "列表":
      case "循环":
        state.playNext();
        break;
      case "随机":
        if (!state.playRandom()) {
          // 没有可播放的歌曲了
          state.setPlaying(false);
        }
        break;
    }
  },

  // 处理上一首歌曲逻辑（基于播放历史）
  handleSongPrevious: () => {
    const state = get();
    return state.playPrevious();
  },

  // 处理播放/暂停
  handleSongPause: () => {
    const state = get();
    if (!state.currentMusic || !state.howlInstance) {
      return false; // 返回 false 表示操作失败
    }

    if (state.playing) {
      state.howlInstance.pause();
    } else {
      state.howlInstance.play();
    }
    return true; // 返回 true 表示操作成功
  },

  // 切换播放模式
  handleTogglePlayMode: () => {
    const state = get();
    switch (state.playMode) {
      case "单曲":
        state.setPlayMode("列表");
        return "已切换为顺序播放~";
      case "列表":
        state.setPlayMode("循环");
        return "已切换为列表循环~";
      case "循环":
        state.setPlayMode("随机");
        return "已切换为随机播放~";
      case "随机":
        state.setPlayMode("单曲");
        return "已切换为单曲循环~";
      default:
        return "";
    }
  },
}));
