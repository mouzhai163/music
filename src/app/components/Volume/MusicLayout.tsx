"use client";
import React, { useEffect, useRef } from "react";
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
import { Howl } from "howler";
import { message } from "antd";

import VolumeControl from "@/components/Volume/VolumeControl";
import { usePlayStore } from "@/store/usePlayStore";
import VolumeInfo from "@/components/Volume/VolumeInfo";
import VolumeCard from "@/components/Volume/VolumeCard";
import { getSongById } from "../../../lib/utils/MusicUtils";
import { musicType } from "../../../types/playlist";



export default function MusicLayout() {
  const {
    setPlaying,
    setCurrentTime,
    setDuration,
    setPlayMode,
    setVolume,
    setMuted,
    setCurrentMusic,
    playNext,
    playPrevious,
    playRandom,
    setPlayList,
  } = usePlayStore();
  const playList = usePlayStore((s) => s.playList);
  const playing = usePlayStore((s) => s.playing);
  const currentTime = usePlayStore((s) => s.currentTime);
  const duration = usePlayStore((s) => s.duration);
  const playMode = usePlayStore((s) => s.playMode);
  const volume = usePlayStore((s) => s.volume);
  const muted = usePlayStore((s) => s.muted);
  const currentMusic = usePlayStore((s) => s.currentMusic);

  const [messageApi, contextHolder] = message.useMessage();

  const success = (msg: string) => {
    messageApi.open({ type: "success", content: msg });
  };
  const warning = (msg: string) => {
    messageApi.open({ type: "warning", content: msg });
  };

  // Howl实例
  const soundRef = useRef<Howl | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);

  const iconBaseClass = "transition-colors icon-smooth cursor-pointer";
  const controlIconClass = `${iconBaseClass} text-gray-700 hover:text-gray-900`;
  const playIconClass = `${iconBaseClass} text-blue-600 hover:text-blue-700`;

  useEffect(() => {
    setPlayList([]);
    // eslint-disable-next-line
  }, []);



  /**
   * 根据播放列表实时更新组件
   */
  useEffect(() => {
    if (!currentMusic?.id) {
      return
    }
    // *** 全局主动 stop+unload，彻底断绝“鬼音” ***
    if (soundRef.current) {
      try {
        soundRef.current.stop();
        soundRef.current.unload();
      } catch (e) { }
      soundRef.current = null;
    }
    let canceled = false;        // 竞态保护
    let localHowl: Howl | null = null;
    (async () => {
      setCurrentTime(0);
      const song = await getSongById(currentMusic.id);
      console.log("返回的对象:" + song)
      if (canceled) return;
      if (!song) {
        warning("歌曲资源加载失败");
        return;
      }
      const sound = new Howl({
        // 初始化的时候不添加源
        src: [song.url],
        html5: true,
        volume: 0,
        onload: () => setDuration(sound.duration()),
        onplay: async () => {
          sound.fade(0, 1, 1000);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          lastTimeRef.current = 0;
          setPlaying(true);
          updateCurrentTime();
        },
        onpause: () => {
          setPlaying(false);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = undefined;
          }
        },
        onend: () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = undefined;
          }
          // 确保最终时间归位到总时长，避免回退
          setCurrentTime(sound.duration());
          lastTimeRef.current = sound.duration();
          setPlaying(false);
          handleSongEnd();
        },
      });
      localHowl = sound;
      soundRef.current = sound;
      sound.play();
    })();


    return () => {
      canceled = true;
      if (localHowl) {
        try {
          localHowl.stop();
          localHowl.unload();
        } catch { }
        localHowl = null;
      }
    };
    // eslint-disable-next-line
  }, [currentMusic]);






  // 切歌模式
  const handleSongEnd = () => {
    switch (playMode) {
      case "单曲":
        soundRef.current?.seek(0);
        soundRef.current?.play();
        break;
      case "列表":
      case "循环":
        playNext();
        break;
      case "随机":
        if (!playRandom()) setPlaying(false);
        break;
    }
  };

  // 进度条点击
  const handleClickProgressBar = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const sound = soundRef.current;
    if (!sound || !duration || duration === 0) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const barWidth = rect.width;
    const clampedClickX = Math.max(0, Math.min(barWidth, clickX));
    const percentage = clampedClickX / barWidth;
    const newTime = duration * percentage;
    try {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      const wasPlaying = sound.playing();
      sound.seek(newTime);
      setCurrentTime(newTime);
      if (wasPlaying || playing) {
        sound.play();
        updateCurrentTime();
      }
    } catch (error) { }
  };

  // 播放/暂停
  const handlePlayPause = () => {
    if (!currentMusic) {
      warning("当前没有可播放的歌曲哦~");
      return;
    }
    const audio = soundRef.current!;
    setPlaying(!playing);
    if (!playing) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  // 上一首
  const handlePrevious = () => {
    playPrevious();
  };

  // 下一首
  const handleNext = () => {
    playNext();
  };

  // 播放方式切换
  const handleTogglePlayMode = () => {
    switch (playMode) {
      case "单曲":
        success("已切换为顺序播放~");
        setPlayMode("列表");
        break;
      case "列表":
        success("已切换为列表循环~");
        setPlayMode("循环");
        break;
      case "循环":
        success("已切换为随机播放~");
        setPlayMode("随机");
        break;
      case "随机":
        success("已切换为单曲循环~");
        setPlayMode("单曲");
        break;
    }
  };

  // 时间格式化
  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 更新播放时间
  const updateCurrentTime = () => {
    const sound = soundRef.current;
    if (sound && sound.playing()) {
      const time = sound.seek() as number;
      // 防抖+单调递增保护：有时底层 seek 报告会小于上一帧
      const clamped = Math.max(time, lastTimeRef.current);
      lastTimeRef.current = clamped;
      setCurrentTime(clamped);
      // 若接近结尾，强制钉在 duration，避免视觉回退
      if (duration && clamped > duration - 0.05) {
        setCurrentTime(duration);
        lastTimeRef.current = duration;
      }
      animationRef.current = requestAnimationFrame(updateCurrentTime);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex-shrink-0 w-60">
        <VolumeInfo />
      </div>
      <div className="flex-1 flex items-center justify-center max-w-4xl mx-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <HeartOutlined className={controlIconClass} size={22} />
            <StepBack
              size={22}
              className={controlIconClass}
              onClick={handlePrevious}
            />
            {playing ? (
              <CirclePause
                size={42}
                className={playIconClass}
                onClick={handlePlayPause}
              />
            ) : (
              <CirclePlay
                size={42}
                className={playIconClass}
                onClick={handlePlayPause}
              />
            )}
            <StepForward
              size={22}
              className={controlIconClass}
              onClick={handleNext}
            />
          </div>
          <div className="flex items-center gap-4 min-w-[600px]">
            <span className="text-sm text-gray-500 min-w-[45px] text-right font-mono">
              {formatTime(currentTime)}
            </span>
            <div
              className="relative flex-1 h-1.5 cursor-pointer group"
              onClick={handleClickProgressBar}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
            >
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div className="absolute inset-0 rounded-full group-hover:bg-gray-300 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full pointer-events-none"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
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
          onClick={handleTogglePlayMode}
        >
          {playMode === "单曲" && (
            <div className="relative w-6 h-6">
              <Repeat className="text-gray-600 hover:text-gray-800" size={22} />
              <span className="absolute text-[9px] font-bold text-gray-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                1
              </span>
            </div>
          )}
          {playMode === "列表" && (
            <ListMusic
              className="text-gray-600 hover:text-gray-800"
              size={22}
            />
          )}
          {playMode === "循环" && (
            <RefreshCcw
              className="text-gray-600 hover:text-gray-800"
              size={22}
            />
          )}
          {playMode === "随机" && (
            <Shuffle className="text-gray-600 hover:text-gray-800" size={22} />
          )}
        </div>
        <div className="flex items-center">
          <VolumeControl
            value={volume}
            muted={muted}
            onChange={(v) => {
              setVolume(v);
              soundRef.current?.volume(v);
            }}
            onMuteChange={(m) => setMuted(m)}
          />
        </div>
        <VolumeCard />
      </div>
    </div>
  );
}
