'use client';
import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Spin, Button, Tooltip, Tag, Avatar, Space } from 'antd';
import {
  HeartOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

import { usePlayStore } from '@/app/store/usePlayStore';
import { Playlist, PlaylistDetailResponse } from '@/types/playlist';
import SongTable from '@/app/components/SongTable';



export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [localPlayList, setLocalPlayList] = useState<Playlist | null>(null);
  const [spinning, setSpinning] = useState<boolean>(false);

  const { setPlayList, setCurrentMusic } = usePlayStore();

  async function getPlayListByid(id: string) {
    setSpinning(true);
    try {
      const res = await axios.post('/api/getPlaylistById', { id });
      const data: PlaylistDetailResponse = res.data;
      if (data.code === 200) {
        setLocalPlayList(data.playlist);
      }
    } catch (err) {
      console.error('获取歌单失败:', err);
    } finally {
      setSpinning(false);
    }
  }

  const { id } = use(params);

  useEffect(() => {
    (async () => {
      await getPlayListByid(id);
    })();
  }, [id]);

  return (
    <div>
      <Spin spinning={spinning} tip="加载中~" fullscreen />
      {!spinning && localPlayList && (
        <div className="p-6 space-y-6">
          {/* 顶部信息 */}
          <div className="flex items-start gap-6">
            <div className="relative w-[240px] h-[240px] overflow-hidden rounded-lg shadow">
              <Image
                src={localPlayList.coverImgUrl}
                alt={localPlayList.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl mb-2">{localPlayList.name}</h1>
              {/* 第一行：仅创作者 */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                <span>创建者：{localPlayList.creator.nickname}</span>
              </div>
              {/* 第二行：其余统计信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                <span>播放量：{localPlayList.playCount}</span>
                <span>曲目数：{localPlayList.trackCount}</span>
                <span>收藏数：{localPlayList.subscribedCount}</span>
                <span>
                  更新时间：{new Date(localPlayList.updateTime).toLocaleString()}
                </span>
              </div>
              {/* 第三行：标签 */}
              {localPlayList.tags?.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {localPlayList.tags.map((t) => (
                    <Tag key={t} color="blue">
                      {t}
                    </Tag>
                  ))}
                </div>
              )}
              <div className="text-base text-gray-700 mb-4 whitespace-pre-wrap">
                {localPlayList.description}
              </div>
              {localPlayList.subscribers?.length > 0 && (
                <div className="mb-3">
                  <Avatar.Group max={{ count: 12 }} size="small">
                    {localPlayList.subscribers.slice(0, 12).map((u) => (
                      <Tooltip key={u.userId} title={u.nickname}>
                        <Avatar src={u.avatarUrl} alt={u.nickname} draggable="true" />
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </div>
              )}
              <Space>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => {
                    setPlayList(localPlayList.tracks);
                    if (localPlayList.tracks.length > 0) {
                      setCurrentMusic(localPlayList.tracks[0]);
                    }
                  }}
                >
                  播放全部
                </Button>
                <Button icon={<HeartOutlined />}>收藏</Button>
              </Space>
            </div>
          </div>

          {/* 歌曲列表 */}
          <SongTable tracks={localPlayList.tracks} />
        </div>
      )}
    </div>
  );
}
