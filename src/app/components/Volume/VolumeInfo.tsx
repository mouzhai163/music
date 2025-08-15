import React from "react";
import { Image } from "antd";

import { usePlayStore } from "@/app/store/usePlayStore";

export default function VolumeInfo() {
  const currentMusic = usePlayStore((s) => (s.currentMusic))
  const playing = usePlayStore((s) => (s.playing))

  return (
    <div className="flex items-center justify-center gap-4 w-full h-full">
      {/* 专辑封面 */}
      <div className={`relative w-[60px] h-[60px] flex-shrink-0 ${playing ? "ripple-effect" : ""}`}>
        {currentMusic && Object.keys(currentMusic).length > 0 ? (
          <div className="relative w-[60px] h-[60px]">
            <Image
              src={currentMusic.al.picUrl}
              alt={currentMusic.name || "封面"}
              sizes="60px"
              className={`rounded-full object-cover transition-all duration-300 album-rotate ${!playing ? "pause-rotation" : ""}`}
              preview={{
                maskClassName: "rounded-full"
              }}
            />
          </div>
        ) : (
          <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-xs">暂无</span>
          </div>
        )}
      </div>

      {/* 歌曲信息 */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="text-base font-medium text-gray-900 truncate">
          {currentMusic?.name || "还未选择歌曲哦"}
        </div>
        <div
          className="text-sm text-gray-500 truncate"
          title={`${currentMusic?.name} - ${currentMusic?.name}`}
        >
          {currentMusic && Object.keys(currentMusic).length > 0
            ? `${currentMusic.ar[0].name} - ${currentMusic.al.name}`
            : ""}
        </div>
      </div>
    </div>
  );
}
