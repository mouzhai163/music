import React from "react";
import Image from "next/image";
import { usePlayStore } from "@/store/usePlayStore";

export default function VolumeInfo() {
  const { playing, currentMusic } = usePlayStore();

  return (
    <div className="flex items-center justify-center gap-4 w-full h-full">
      {/* 专辑封面 */}
      <div className={`relative flex-shrink-0 ${playing ? "ripple-effect" : ""}`}>
        {currentMusic && currentMusic.picUrl ? (
          <Image
            src={currentMusic.picUrl}
            alt={currentMusic.name || "封面"}
            width={60}
            height={60}
            className={`rounded-full object-cover transition-all duration-300 album-rotate ${!playing ? "pause-rotation" : ""
              }`}
            unoptimized
          />
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
          {currentMusic?.artists && currentMusic?.album
            ? `${currentMusic.artists} - ${currentMusic.album}`
            : ""}
        </div>
      </div>
    </div>
  );
}
