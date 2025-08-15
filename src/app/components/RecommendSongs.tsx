"use client";
import React, { useEffect, useState } from "react";
import { Space, Typography } from "antd";
import { Song } from "@/types/album";
import SongTable from "@/app/components/SongTable";
import axios from "axios";

const { Title } = Typography;


export default function RecommendSongs() {
  const [data, setData] = useState<Song[]>([]);


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

  return (
    <Space direction="vertical" size={16} className="w-full mt-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <Title level={4} className="m-0">
          推荐歌曲
        </Title>
      </div>
      {/* 使用 SongTable 组件 */}
      <SongTable tracks={data} />
    </Space>
  );
}
