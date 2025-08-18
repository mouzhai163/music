'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button, Table, Space, Avatar, message, Tag, Modal, Radio, Alert } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import useDownloader from 'react-use-downloader';

import { usePlayStore } from '@/app/store/usePlayStore';
import { Song } from '@/types/album';
import { SongDataType } from '@/types/song_url';


export default function SongTable({ tracks }: {tracks: Song[]}) {
  const [addingId, setAddingId] = useState<string | number | null>(null);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('standard');
  const [currentDownloadTrack, setCurrentDownloadTrack] = useState<Song | null>(null);
  const { pushPlayList, addSongToPlayList, setCurrentMusic } = usePlayStore();
  const { download } = useDownloader();

  const currentMusic = usePlayStore((s) => s.currentMusic);
  const howlInstance = usePlayStore((s) => s.howlInstance);

  const [messageApi, contextHolder] = message.useMessage();
  const success = (msg: string) => messageApi.success(msg);
  const errorMsg = (msg: string) => messageApi.error(msg);

  // 用事件驱动的播放状态，保证按钮图标切换
  const [isPlaying, setIsPlaying] = useState(false);

  // 工具：根据可用音质返回标签数组
  const getQualityTags = (s: Song): JSX.Element[] => {
    const tags: JSX.Element[] = [];
    if (s.hr) tags.push(<Tag key="hr" color="gold" style={{ fontSize: '11px', padding: '0 4px' }}>Hi-Res</Tag>);
    if (s.sq) tags.push(<Tag key="sq" color="purple" style={{ fontSize: '11px', padding: '0 4px' }}>SQ</Tag>);
    if (s.h) tags.push(<Tag key="h" color="default" style={{ fontSize: '11px', padding: '0 4px' }}>HQ</Tag>);
    if (s.m) tags.push(<Tag key="m" color="blue" style={{ fontSize: '11px', padding: '0 4px' }}>MV</Tag>);
    return tags.length > 0 ? tags : [<span key="none">-</span>];
  };

  // 工具：格式化毫秒为 mm:ss / hh:mm:ss
  const formatDuration = (ms: number): string => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss.padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!howlInstance) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(howlInstance.playing());

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onStop = () => setIsPlaying(false);
    const onEnd = () => setIsPlaying(false);

    howlInstance.on('play', onPlay);
    howlInstance.on('pause', onPause);
    howlInstance.on('stop', onStop);
    howlInstance.on('end', onEnd);

    return () => {
      howlInstance.off('play', onPlay);
      howlInstance.off('pause', onPause);
      howlInstance.off('stop', onStop);
      howlInstance.off('end', onEnd);
    };
  }, [howlInstance]);

  // 行内播放/暂停
  const handlePlaying = (track: Song) => {
    // 同一首：切换播放/暂停
    if (currentMusic?.id === track.id) {
      if (howlInstance?.playing()) {
        howlInstance.pause();
        success('暂停播放：' + track.name);
      } else {
        howlInstance?.play();
        success('继续播放：' + track.name);
      }
      return;
    }
    // 切到另一首：推进队列并设为当前曲目，由全局播放器接管播放
    pushPlayList(track);
    setCurrentMusic(track);
    success('开始播放：' + track.name);
  };

  // 显示音质选择弹窗
  const showDownloadModal = (track: Song) => {
    setCurrentDownloadTrack(track);
    // 获取可用音质并设置默认选中第一个
    const availableQualities = getAvailableQualities(track);
    if (availableQualities.length > 0) {
      setSelectedQuality(availableQualities[0].value);
    }
    setDownloadModalVisible(true);
  };

  // 实际执行下载
  const handleDownload = async (track: Song, level: string) => {
    try {
      const req = await axios.post('/api/getSongById', { id: track.id, level });
      const data: SongDataType = req.data;
      if (data.code !== 200) {
        throw new Error('参数有误! 或者服务器异常!');
      }
      const url = data.data[0].url;
      const ext = url.split('?')[0].split('.').pop() || 'mp3';

      // 使用 Next.js 代理路径解决跨域问题 很笨的办法 但是很有效
      let proxyUrl = url;
      if (url.includes('m704.music.126.net')) {
        proxyUrl = url.replace('http://m704.music.126.net', '/proxy/music');
      } else if (url.includes('m804.music.126.net')) {
        proxyUrl = url.replace('http://m804.music.126.net', '/proxy/music2');
      }
      download(proxyUrl.split('?')[0], `${track.name}.${ext}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errorMsg(msg);
    }
  };

  // 获取歌曲可用音质选项
  const getAvailableQualities = (track: Song) => {
    const qualities = [];

    if (track.l) {
      qualities.push({
        value: 'standard',
        label: '标准音质',
        desc: '128kbps',
        bitrate: track.l.br
      });
    }

    if (track.m) {
      qualities.push({
        value: 'higher',
        label: '较高音质',
        desc: '192kbps',
        bitrate: track.m.br
      });
    }

    if (track.h) {
      qualities.push({
        value: 'exhigh',
        label: '极高音质',
        desc: '320kbps',
        bitrate: track.h.br
      });
    }

    if (track.sq) {
      qualities.push({
        value: 'lossless',
        label: '无损音质',
        desc: 'SQ',
        bitrate: track.sq.br
      });
    }

    if (track.hr) {
      qualities.push({
        value: 'hires',
        label: 'Hi-Res音质',
        desc: 'Hi-Res',
        bitrate: track.hr.br
      });
    }

    return qualities;
  };

  // 确认下载
  const confirmDownload = () => {
    if (currentDownloadTrack) {
      const qualities = getAvailableQualities(currentDownloadTrack);
      const selectedQualityInfo = qualities.find(q => q.value === selectedQuality);
      const qualityLabel = selectedQualityInfo ? selectedQualityInfo.label : selectedQuality;

      messageApi.success(`开始下载：${currentDownloadTrack.name} (${qualityLabel})`);
      handleDownload(currentDownloadTrack, selectedQuality);
      setDownloadModalVisible(false);
      setCurrentDownloadTrack(null);
    }
  };

  const actionBtnClass =
    '!inline-flex !items-center !justify-center !w-9 !h-9 !p-0 !leading-none !rounded-full !border !border-gray-200 hover:!bg-gray-150 hover:!shadow-md transition';

  const columns: import('antd').TableProps<Song>['columns'] = [
    {
      title: '',
      dataIndex: ['al', 'picUrl'],
      key: 'picUrl',
      width: 36,
      render: (url?: string) => <Avatar shape="square" size={48} src={url} />,
    },
    {
      title: '歌曲名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      onCell: () => ({ style: { paddingLeft: 8 } }),
      render: (_: unknown, r: Song) => (
        <Space size={6}>
          <span>{r.name}</span>
          {r.fee && r.fee > 0 ? (
            <Tag color="gold" style={{ marginLeft: 4 }}>VIP</Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: '歌手',
      dataIndex: 'ar',
      key: 'artists',
      width: 150,
      render: (_: unknown, r: Song) => r.ar?.map((a) => a.name).join(' / ') || '-',
    },
    { title: '专辑', dataIndex: ['al', 'name'], key: 'album', width: 150, ellipsis: true },
    {
      title: '音质',
      key: 'quality',
      width: 150,
      render: (_: unknown, r: Song) => (
        <Space size={4} wrap>
          {getQualityTags(r)}
        </Space>
      ),
    },
    {
      title: '时长',
      dataIndex: 'dt',
      key: 'duration',
      width: 150,
      render: (dt: number) => formatDuration(dt),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Song) => {
        const rowIsPlaying = isPlaying && currentMusic?.id === record.id;
        return (
          <Space>
            <Button
              className={actionBtnClass}
              type="text"
              shape="circle"
              icon={
                rowIsPlaying ? (
                  <PauseCircleOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />
                ) : (
                  <PlayCircleOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />
                )
              }
              aria-label="播放"
              onClick={() => handlePlaying(record)}
            />
            <Button
              className={actionBtnClass}
              type="text"
              shape="circle"
              icon={<PlusOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />}
              aria-label="添加到歌单"
              loading={addingId === record.id}
              onClick={async () => {
                try {
                  setAddingId(record.id);
                  addSongToPlayList(record);
                  messageApi.success('已添加到歌单：' + record.name);
                } catch {
                  errorMsg('添加失败：网络异常');
                } finally {
                  setAddingId(null);
                }
              }}
            />
            <Button
              className={actionBtnClass}
              type="text"
              shape="circle"
              icon={<DownloadOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />}
              aria-label="下载"
              onClick={() => showDownloadModal(record)}
            />
          </Space>
        );
      },
    },
  ];

  const dataSource = useMemo(
    () => tracks.map((t, idx) => ({ key: t.id ?? idx, ...t })),
    [tracks]
  );

  return (
    <>
      {contextHolder}
      <Table<Song> columns={columns} dataSource={dataSource} rowKey={(r) => String(r.id)} />

      {/* 音质选择弹窗 */}
      <Modal
        title="选择下载音质"
        open={downloadModalVisible}
        onOk={confirmDownload}
        onCancel={() => setDownloadModalVisible(false)}
        okText="下载"
        cancelText="取消"
        width={400}
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            歌曲：<span className="font-medium">{currentDownloadTrack?.name}</span>
          </p>

          {/* 账号权限提示 */}
          <Alert
            message="当前账号为黑胶账号，可能下载不了最高品质"
            type="warning"
            showIcon
            className="!my-4"
          />

          <Radio.Group
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            className="w-full"
          >
            <div className="space-y-3">
              {currentDownloadTrack && getAvailableQualities(currentDownloadTrack).map((quality) => (
                <Radio key={quality.value} value={quality.value} className="w-full">
                  <div className="flex justify-between items-center w-full">
                    <span>{quality.label}</span>
                    <span className="text-gray-400 text-sm">
                      {quality.bitrate ? `${Math.round(quality.bitrate / 1000)}kbps` : quality.desc}
                    </span>
                  </div>
                </Radio>
              ))}
              {currentDownloadTrack && getAvailableQualities(currentDownloadTrack).length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  该歌曲暂无可用音质
                </div>
              )}
            </div>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
}
