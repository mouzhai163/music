import { create } from "zustand";
import { musicType } from "./usePlayStore";

type HotMusicListState = {
  hotMusicList: musicType[][];
  setHotMusicList: (lists: musicType[][]) => void;
  addHotMusicList: (newList: musicType[]) => void;
  removeHotMusicList: (index: number) => void;
  clearHotMusicList: () => void;
};

export const useHotMusicListStore = create<HotMusicListState>((set) => ({
  hotMusicList: [],
  setHotMusicList: (lists) => set({ hotMusicList: lists }),
  addHotMusicList: (newList) =>
    set((state) => ({ hotMusicList: [...state.hotMusicList, newList] })),
  removeHotMusicList: (index) =>
    set((state) => ({
      hotMusicList: state.hotMusicList.filter((_, i) => i !== index),
    })),
  clearHotMusicList: () => set({ hotMusicList: [] }),
}));
