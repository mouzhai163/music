"use client";

import React, { useEffect, useState } from "react";
import { Typography, List, Card, Space } from "antd";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Playlist } from "@/types/playlist";

const { Title, Text } = Typography;


function onMore(): void {
  // TODO: 跳转或加载更多
  return;
}

export default function RecommendPlayList() {
  const [data, setData] = useState<Playlist[]>([]);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/RecommendPlayList");
        if (cancelled) return;
        // 期望后端返回 { code: 200, data: IPlayList[] }
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setData(list);
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Space direction="vertical" size={16} className="w-full">
      {/* Title */}
      <div className="flex items-center justify-between">
        <Title level={4} className="m-0">
          推荐歌单
        </Title>
        <Text
          onClick={onMore}
          className="cursor-pointer !text-blue-600 select-none"
        >
          更多
        </Text>
      </div>

      <List
        grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 6, xl: 7, xxl: 8 }}
        dataSource={data}
        renderItem={(item: Playlist) => (
          <List.Item key={String(item.id)} style={{ overflow: "visible" }}>
            <Card
              onClick={() => router.push(`/playlist/${item.id}`)}
              hoverable
              className="group rounded-xl border border-gray-100 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform-gpu hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 hover:border-gray-200 cursor-pointer"
              classNames={{ body: "p-3" }}
              cover={
                item.coverImgUrl ? (
                  // ✅ 固定比例容器（正方形），随宽度变化成比例缩放
                  <div className="relative w-full pt-[100%] overflow-hidden rounded-t-xl bg-white">
                    <Image
                      src={item.coverImgUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  // 占位也用同样比例，保持统一
                  <div className="relative w-full pt-[100%] rounded-t-xl bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                      暂无图片
                    </div>
                  </div>
                )
              }
            >
              <div className="flex flex-col gap-1">
                {/* 标题：两行省略 + 固定两行高度 */}
                <h3
                  className="text-base font-medium leading-tight tracking-tight text-gray-900 min-h-[2.5rem]"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={item.name}
                >
                  {item.name}
                </h3>

                {/* 描述：单行省略；无内容也占位保持等高 */}
                <p
                  className="text-sm leading-5 text-gray-500 min-h-5 truncate"
                  title={item.description || ""}
                >
                  {item.description || "\u00A0"}
                </p>
              </div>
            </Card>
          </List.Item>
        )}
      />

    </Space>
  );
}
