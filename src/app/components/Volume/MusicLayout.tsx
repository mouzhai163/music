"use client";
import React, { useEffect } from "react";
import {
  StepBack,
  CirclePlay,
  StepForward,
  CirclePause,
  Shuffle,
  RefreshCcw,
  ListMusic,
  Repeat,
} from "lucide-react";
import { HeartOutlined } from "@ant-design/icons";
import { message } from "antd";
import axios from "axios";
import { Howl } from "howler";

import VolumeControl from "@/app/components/Volume/VolumeControl";
import VolumeInfo from "@/app/components/Volume/VolumeInfo";
import VolumeCard from "@/app/components/Volume/VolumeCard";
import { usePlayStore } from "@/app/store/usePlayStore";

export default function MusicLayout() {
  const {
    setVolume,
    setMuted,
    setPlayList,
    createHowlerInstance,
    seekTo,
    howlInstance,
    handleSongNext,
    handleSongPrevious,
    handleSongPause,
    handleTogglePlayMode
  } = usePlayStore();

  const currentTime = usePlayStore((s) => s.currentTime);
  const duration = usePlayStore((s) => s.duration);
  const playMode = usePlayStore((s) => s.playMode);
  const volume = usePlayStore((s) => s.volume);
  const muted = usePlayStore((s) => s.muted);
  const currentMusic = usePlayStore((s) => s.currentMusic);
  const isPlaying = usePlayStore((s) => s.playing);

  const [messageApi, contextHolder] = message.useMessage();
  
  // 包装 store 方法以添加消息提示
  const handlePlayPause = () => {
    const success = handleSongPause();
    if (!success) {
      messageApi.warning("当前没有可播放的歌曲哦~");
    }
  };
  
  const handlePrevious = () => {
    const success = handleSongPrevious();
    if (!success) {
      messageApi.warning("没有上一首歌曲了~");
    }
  };
  
  const handleModeToggle = () => {
    const message = handleTogglePlayMode();
    if (message) {
      messageApi.success(message);
    }
  };




  const iconBaseClass = "transition-colors icon-smooth cursor-pointer";
  const controlIconClass = `${iconBaseClass} text-gray-700 hover:text-gray-900`;
  const playIconClass = `${iconBaseClass} text-blue-600 hover:text-blue-700`;

  // 初始化播放列表  这里可以改成读取本地浏览器历史
  useEffect(() => {
    setPlayList([]);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!currentMusic) return;
    let tmphowlInstance: Howl;
    const getMusicInst = async () => {
      // 在线播放歌曲默认为standard音质
      const res = await axios.post("/api/getSongById", {
        id: currentMusic.id,
        level: "standard"
      })
      if (res.status === 200) {
        if (res.data.code != 200) throw new Error("获取歌曲接口异常!");
        // 创建全局Howl实例对象
        const h = createHowlerInstance(res.data.data[0])
        tmphowlInstance = h
      } else {
        message.error("接口异常!");
        throw new Error("获取歌曲接口异常!");
      }
    }
    getMusicInst()
    return () => {
      // 清理howler对象
      tmphowlInstance.stop()
      tmphowlInstance.unload()
    }
  }, [currentMusic])












  // 时间格式化
  const formatTime = (time: number) => {
    const min = Math.floor((time || 0) / 60);
    const sec = Math.floor((time || 0) % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 进度条点击处理
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !howlInstance) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressBarWidth = rect.width;
    
    // 计算点击位置对应的时间
    const clickRatio = clickX / progressBarWidth;
    const targetTime = clickRatio * duration;
    
    // 跳转到目标时间
    howlInstance.seek(targetTime);
    seekTo(targetTime);
  };


  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex-shrink-0 w-60">
        <VolumeInfo />
      </div>

      <div className="flex-1 flex items-center justify-center max-w-4xl mx-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <HeartOutlined className={controlIconClass} />
            {/* 上一首歌 */}
            <StepBack size={22} className={controlIconClass} onClick={handlePrevious} />

            {isPlaying ? (
              <CirclePause size={42} className={playIconClass} onClick={handlePlayPause} />
            ) : (
              <CirclePlay size={42} className={playIconClass} onClick={handlePlayPause} />
            )}

            <StepForward size={22} className={controlIconClass} onClick={handleSongNext} />
          </div>

          <div className="flex items-center gap-4 min-w-[600px]">
            <span className="text-sm text-gray-500 min-w-[45px] text-right font-mono">
              {/* 当前播放时间 */}
              {formatTime(currentTime)}
            </span>
            {/* 进度条 */}
            <div
              className="relative flex-1 h-1.5 cursor-pointer group progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime || 0}
              onClick={handleProgressBarClick}
            >
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div className="absolute inset-0 rounded-full group-hover:bg-gray-300 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full pointer-events-none"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* 歌曲总时间 */}
            <span className="text-sm text-gray-500 min-w-[45px] font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 flex-shrink-0 w-80 justify-end">
        {contextHolder}
        <div
          className="hover:cursor-pointer p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleModeToggle}
        >
          {playMode === "单曲" && (
            <div className="relative w-6 h-6">
              <Repeat className="text-gray-600 hover:text-gray-800" size={22} />
              <span className="absolute text-[9px] font-bold text-gray-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                1
              </span>
            </div>
          )}
          {playMode === "列表" && <ListMusic className="text-gray-600 hover:text-gray-800" size={22} />}
          {playMode === "循环" && <RefreshCcw className="text-gray-600 hover:text-gray-800" size={22} />}
          {playMode === "随机" && <Shuffle className="text-gray-600 hover:text-gray-800" size={22} />}
        </div>

        <div className="flex items-center">
          <VolumeControl
            value={volume}
            muted={muted}
            onChange={(v) => {
              setVolume(v);
              // howlerRef.current?.volume(v);
            }}
            onMuteChange={(m) => {
              setMuted(m);
              // howlerRef.current?.mute(m);
            }}
          />
        </div>
        <VolumeCard />
      </div>
    </div>
  );
}
