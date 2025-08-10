"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ITrack } from "../../types/playlist";
import { usePlayStore } from "@/store/usePlayStore";
import { Space, Typography, Button, message } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import useDownloader from 'react-use-downloader';
import axios from "axios";

const { Title, Text } = Typography;
let visible: ITrack[]

function onMore() {

}



export default function RecommendSongs() {
  const [selectedId, setSelectedId] = useState<ITrack["id"] | null>(null);
  const [data, setData] = useState<ITrack[]>([]);
  const { pushPlayList, setPlaying, setCurrentMusic } = usePlayStore()
  const playing = usePlayStore((s) => s.playing)
  const currentMusic = usePlayStore((s) => s.currentMusic)
  const { download } = useDownloader();
  const [messageApi, contextHolder] = message.useMessage();
  const success = (msg: string) => messageApi.success(msg);
  const errorMsg = (msg: string) => messageApi.error(msg);

  visible = Array.isArray(data) ? data.slice(0, 30) : [];
  const toggleSelect = (id: ITrack["id"]) =>
    setSelectedId((prev) => (prev === id ? null : id));

  // 初始化组件
  useEffect(() => {
    axios.get("/api/RecommendSongs").then(res => {
      if (res.data.code === 200) {
        setData(res.data.data)
      } else {
        setData([])
      }
    }).catch(e => {
      console.log(e)
      setData([])
    })
  }, []);


  async function onPlay(e: React.MouseEvent, track: ITrack) {
    e.stopPropagation();
    toggleSelect(track.id);
    // 3: push对象到播放列表
    pushPlayList(track)
    // 3.1: 直接设为当前播放，确保 UI 立刻切换
    setCurrentMusic(track)
    success('开始播放：' + track.name)
    // 4: 开始播放
    setPlaying(true)
  }

  return (
    <Space direction="vertical" size={16} className="w-full mt-5">
      {contextHolder}
      {/* Title */}
      <div className="flex items-center justify-between">
        <Title level={4} className="m-0">
          推荐歌曲
        </Title>
        <Text
          onClick={onMore}
          className="cursor-pointer !text-blue-600 select-none"
        >
          更多
        </Text>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {visible.map((it) => {
          const selected = it.id === selectedId;
          const artistText = Array.isArray((it).artists)
            ? (it).artists.join("、")
            : (it).artists ?? "";
          return (
            <div
              key={String(it.id)}
              className="relative group cursor-pointer"
              onClick={(e) => onPlay(e, it)}
              aria-selected={selected}
            >
              <div
                className={[
                  "pointer-events-none absolute inset-y-0 left-0 right-0 rounded-2xl transition-colors",
                  selected
                    ? "bg-gray-200"
                    : "group-hover:bg-gray-200/60 dark:group-hover:bg-white/15",
                ].join(" ")}
              />

              {/* 行内容 */}
              <div className="relative grid grid-cols-[56px_1fr_auto] items-center gap-x-3 py-2 px-3">
                {/* 封面 */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                  {it.picUrl ? (
                    <Image
                      src={it.picUrl}
                      alt={it.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                {/* 标题 / 副标题 */}
                <div className="min-w-0">
                  <div
                    className="text-[15px] leading-6 text-gray-900 truncate"
                    title={it.name}
                  >
                    {it.name}
                  </div>
                  <div
                    className="text-sm leading-5 text-gray-400 truncate"
                    title={artistText}
                  >
                    {artistText || "\u00A0"}
                  </div>
                </div>

                {/* 操作按钮：播放 / 添加 / 下载 */}
                <div className="relative z-[1] ml-2 flex items-center gap-2">
                  <Button
                    type="text"
                    shape="circle"
                    className="!inline-flex !items-center !justify-center !w-9 !h-9 !p-0 !leading-none !rounded-full !border !border-gray-200 hover:!bg-gray-50 hover:!shadow-md transition"
                    aria-label={playing && currentMusic?.id === String(it.id) ? "暂停" : "播放"}
                    onClick={(e) => onPlay(e, it)}
                    icon={
                      (playing && currentMusic?.id === String(it.id)) ? (
                        <PauseCircleOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />
                      ) : (
                        <PlayCircleOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />
                      )
                    }
                  />
                  <Button
                    type="text"
                    shape="circle"
                    className="!inline-flex !items-center !justify-center !w-9 !h-9 !p-0 !leading-none !rounded-full !border !border-gray-200 hover:!bg-gray-50 hover:!shadow-md transition"
                    aria-label="添加到歌单"
                    onClick={async (e) => {
                      e.stopPropagation();
                      usePlayStore.getState().addSongToPlayList(it)
                      success('已添加到歌单：' + it.name)
                    }}
                    icon={<PlusOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />}
                  />
                  <Button
                    type="text"
                    shape="circle"
                    className="!inline-flex !items-center !justify-center !w-9 !h-9 !p-0 !leading-none !rounded-full !border !border-gray-200 hover:!bg-gray-50 hover:!shadow-md transition"
                    aria-label="下载"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await axios.get(`/api/song_v1?id=${it.id}`)
                        if (res.data.code === 200) {
                          const url: string = res.data.data.url
                          const ext = url.split('?')[0].split('.').pop() || 'mp3'
                          download(url, `${it.name}.${ext}`)
                          success('开始下载：' + it.name)
                        } else {
                          errorMsg('下载失败：服务器返回错误')
                        }
                      } catch (err) {
                        errorMsg('下载失败：网络异常')
                      }
                    }}
                    icon={<DownloadOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Space>
  );
}
