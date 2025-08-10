'use client'
import { Spin, Button, Table, Space, Avatar, message } from 'antd'
import axios from 'axios'
import React, { useEffect, useMemo, useState, use } from 'react'
import Image from 'next/image'
import type { IPlaylistDetail, ITrack } from '../../../../types/playlist'
import { PlayCircleOutlined, PauseCircleOutlined, DownloadOutlined, HeartOutlined, PlusOutlined } from '@ant-design/icons'
import useDownloader from 'react-use-downloader';
import { usePlayStore } from '@/store/usePlayStore'


function SongTable({ tracks }: { tracks: ITrack[] }) {
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [addingId, setAddingId] = useState<string | number | null>(null);
  const { download } = useDownloader();
  const { pushPlayList, setPlaying, setCurrentMusic, playing, currentMusic, addSongToPlayList } = usePlayStore();
  const [messageApi, contextHolder] = message.useMessage();
  const success = (msg: string) => messageApi.success(msg);
  const errorMsg = (msg: string) => messageApi.error(msg);


  const handlePlaying = async (track: ITrack) => {
    pushPlayList(track)
    success('开始播放：' + track.name)
    setPlaying(true)
  }


  const handleDownload = async (track: ITrack) => {
    try {
      setDownloadingId(track.id);
      // 调用 song_v1 获取真实音频地址  这里可以抽象出来 等待修改
      const res = await axios.get(`/api/song_v1?id=${track.id}`);
      const data = res.data
      if (data.code === 200) {
        // 下载地址
        const fileUrl: string = data.data.url
        // 尝试从 url 推断扩展名
        const ext = fileUrl.split('?')[0].split('.').pop() || 'mp3';
        download(fileUrl, track.name + "." + ext)
      } else {
        throw new Error('下载失败!服务器出现错误!');
      }
    } catch (e) {
      console.error('下载失败', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const actionBtnClass = "!inline-flex !items-center !justify-center !w-9 !h-9 !p-0 !leading-none !rounded-full !border !border-gray-200 hover:!bg-gray-50 hover:!shadow-md transition";
  const columns: import('antd').TableProps<ITrack>['columns'] = [
    {
      title: '', dataIndex: 'picUrl', key: 'picUrl', width: 36, render: (url: string) => (
        <Avatar shape="square" size={48} src={url} />
      )
    },
    { title: '歌曲名', dataIndex: 'name', key: 'name', ellipsis: true, width: 300, onCell: () => ({ style: { paddingLeft: 8 } }) },
    { title: '歌手', dataIndex: 'artists', key: 'artists', width: 170 },
    { title: '专辑', dataIndex: 'album', key: 'album', width: 220, ellipsis: true },
    {
      title: '操作', key: 'actions', width: 160,
      render: (_: unknown, record: ITrack) => (
        <Space>
          <Button className={actionBtnClass} type="text" shape="circle" icon={(playing && currentMusic?.id === String(record.id)) ? <PauseCircleOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} /> : <PlayCircleOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />} aria-label="播放" onClick={() => handlePlaying(record)} />
          <Button className={actionBtnClass} type="text" shape="circle" icon={<PlusOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />} aria-label="添加到歌单" loading={addingId === record.id} onClick={async () => {
            try {
              setAddingId(record.id)
              // 这里抽象出来, 这里只负责添加ITrack对象即可,播放由howl实例去获取src
              addSongToPlayList(record)
              success('已添加到歌单：' + record.name)
            } catch (e) {
              errorMsg('添加失败：网络异常')
            } finally {
              setAddingId(null)
            }
          }} />
          <Button className={actionBtnClass} type="text" shape="circle" icon={<DownloadOutlined style={{ fontSize: 20, verticalAlign: 'middle' }} />} aria-label="下载" loading={downloadingId === record.id} onClick={async () => {
            try {
              setDownloadingId(record.id)
              const res = await axios.get(`/api/song_v1?id=${record.id}`)
              if (res.data.code === 200) {
                const fileUrl: string = res.data.data.url
                const ext = fileUrl.split('?')[0].split('.').pop() || 'mp3';
                download(fileUrl, `${record.name}.${ext}`)
                success('开始下载：' + record.name)
              } else {
                errorMsg('下载失败：服务器返回错误')
              }
            } catch (e) {
              errorMsg('下载失败：网络异常')
            } finally {
              setDownloadingId(null)
            }
          }} />
        </Space>
      )
    }
  ];

  const dataSource = useMemo(() => tracks.map((t, idx) => ({ key: t.id ?? idx, ...t })), [tracks]);

  return (
    <>
      {contextHolder}
      <Table<ITrack>
        columns={columns}
        dataSource={dataSource}
        rowKey={(r) => String(r.id)}
      />
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [playlist, setPlayList] = useState<IPlaylistDetail | null>(null)
  const [spinning, setSpinning] = useState<boolean>(false)

  async function getPlayListByid(id: string) {
    setSpinning(true)
    try {
      const res = await axios.get(`http://127.0.0.1:5000/Playlist?id=${id}`)
      const data = res.data
      if (data?.status === 200) {
        setPlayList(data.playlist)
      }
    } catch (err) {
      console.error('获取歌单失败:', err)
    } finally {
      setSpinning(false)
    }
  }

  const { id } = use(params);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await getPlayListByid(id)
    })()
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div>
      <Spin spinning={spinning} tip="加载中~" fullscreen />
      {!spinning && playlist && (
        <div className="p-6 space-y-6">
          {/* 顶部信息 */}
          <div className="flex items-start gap-6">
            <div className="relative w-[160px] h-[160px] overflow-hidden rounded-lg shadow">
              <Image src={playlist.coverImgUrl} alt={playlist.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl  mb-2">{playlist.name}</h1>
              <div className="text-sm text-gray-600 mb-4">创建者：{playlist.creator}</div>
              <Space>
                <Button type="primary" icon={<PlayCircleOutlined />}>播放全部</Button>
                <Button icon={<HeartOutlined />}>收藏</Button>
              </Space>
            </div>
          </div>

          {/* 歌曲列表 */}
          <SongTable tracks={playlist.tracks} />
        </div>
      )}
    </div>
  )
}
