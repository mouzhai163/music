import React from "react";
import { usePlayStore } from "@/store/usePlayStore";
import { Popover } from "antd";
import { List, Trash2 } from "lucide-react";
import Image from "next/image";
import { ITrack } from "../../../types/playlist";

export default function VolumeCard() {
  const { clearPlayList, setCurrentMusic, setPlaying } = usePlayStore();
  const playList = usePlayStore((s) => s.playList);
  const currentMusic = usePlayStore((s) => s.currentMusic);

  const handleSelect = (music: ITrack) => {
    setCurrentMusic(music);
    setPlaying(true);
  };

  function handleClearPlayList(): void {
    clearPlayList();
    setCurrentMusic({} as ITrack);
    setPlaying(false);
  }

  const popoverTitle = (
    <div className="flex items-center justify-between">
      <span>播放列表</span>
      <button
        className="p-1 hover:bg-red-50 rounded transition"
        onClick={handleClearPlayList}
        title="清空歌单"
      >
        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
      </button>
    </div>
  );

  const content = (
    <div className="w-80 h-80 bg-white overflow-y-auto rounded p-2">
      {playList.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          暂无歌曲
        </div>
      ) : (
        playList.map((music, index) => {
          const isActive = currentMusic?.id === music.id;
          return (
            <div
              key={index}
              onClick={() => handleSelect(music)}
              className={
                "group flex items-center p-2 pr-4 transition cursor-pointer rounded-lg relative " +
                (isActive
                  ? "bg-blue-50 ring-2 ring-blue-400/50 shadow-md"
                  : "hover:bg-gray-200/60 hover:shadow-sm")
              }
              style={{
                marginBottom: "4px",
                minHeight: "52px",
              }}
            >
              {/* 蓝色圆点指示器 */}
              <div className="w-4 flex items-center justify-center">
                {isActive && (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 shadow animate-pulse"></span>
                )}
              </div>
              <Image
                src={music.picUrl}
                alt={music.name}
                width={40}
                height={40}
                className="rounded object-cover mx-2 shadow"
                unoptimized
              />

              <div className="flex-1 overflow-hidden">
                <div
                  className={
                    "text-sm truncate " +
                    (isActive
                      ? "text-blue-700 font-bold"
                      : "text-gray-800 font-medium group-hover:text-blue-600")
                  }
                >
                  {music.name}
                </div>
                <div
                  className={
                    "text-xs truncate mt-0.5 " +
                    (isActive
                      ? "text-blue-400"
                      : "text-gray-500 group-hover:text-gray-700")
                  }
                >
                  {music.artists}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <Popover content={content} trigger="click" title={popoverTitle}>
      <div
        className="p-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        title="播放列表"
      >
        <List className="text-gray-600 hover:text-gray-800" size={22} />
      </div>
    </Popover>
  );
}