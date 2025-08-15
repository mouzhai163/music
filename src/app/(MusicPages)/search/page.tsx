"use client";
import axios from "axios";
import React, { useState } from "react";
import { Image, Space, Typography } from "antd";
import SongTable from "@/app/components/SongTable";
import { Song } from "@/types/album";
import { blockDataType, resourcesDataType } from "@/types/compleSearch";

const { Title,Text } = Typography;

export default function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [activeType, setActiveType] = useState<
    "综合" | "歌手" | "歌曲" | "专辑" | "歌单"
  >("综合");
  const [results, setResults] = useState<blockDataType[]>();
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    const q = searchValue.trim();
    if (!q) return;

    const urlMap: Record<typeof activeType, string> = {
      综合: `/api/compleSearch`,
      歌手: `/api/search/singer?keywords=${encodeURIComponent(q)}&limit=20`,
      歌曲: `/api/search/song?keywords=${encodeURIComponent(q)}&limit=20`,
      专辑: `/api/search/album?keywords=${encodeURIComponent(q)}&limit=20`,
      歌单: `/api/search/playlist?keywords=${encodeURIComponent(q)}&limit=20`,
    };

    const endpoint = urlMap[activeType];
    try {
      const res = await axios.post(endpoint, {
        keyword: searchValue,
      });
      if (res.status === 200) {
        // 过滤数据
        const allowBlocks = [
          "search_block_best_match",
          "search_block_song",
          "search_block_playlist",
          "search_block_album",
        ];
        const blocks = res.data.data.blocks;
        const visibleBlocks = blocks.filter(
          (block: blockDataType) =>
            typeof block?.blockCode === "string" &&
            allowBlocks.includes(block.blockCode) &&
            Array.isArray(block.resources) &&
            block.resources.length > 0
        );
        console.log(visibleBlocks);
        setResults(visibleBlocks);
        // 延迟显示结果，等待搜索框动画完成
        setTimeout(() => {
          setShowResults(true);
        }, 600); // 与搜索框动画时间一致
      } else {
        throw new Error("Search - API接口异常!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const types: Array<"综合" | "歌手" | "歌曲" | "专辑" | "歌单"> = [
    "综合",
    "歌手",
    "歌曲",
    "专辑",
    "歌单",
  ];
  const tabBase =
    "px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer";

  // 核心：根据 hasResults 切换位置（中间略偏上 -> 左上角）
  const CENTER_OFFSET_PX = 60; // 向右微移以与提示内容对齐
  const searchWrapStyle: React.CSSProperties = results
    ? { top: 16, left: 16, transform: "translate(0,0) scale(0.98)" }
    : {
        top: "35%",
        left: "50%",
        transform: `translate(calc(-50% + ${CENTER_OFFSET_PX}px), -50%) scale(1)`,
      };

  return (
    <div className="relative min-h-screen p-4">
      {/* 可移动搜索容器 */}
      <div
        className="absolute w-full max-w-2xl transition-all duration-600 ease-out"
        style={searchWrapStyle}
      >
        <div className="mb-3 text-gray-700">搜索歌手或歌曲名</div>

        {/* 搜索框行（保持中间展示；有结果时它整体会平移到左上角） */}
        <div className="flex items-center gap-3">
          <input
            className="flex-1 max-w-sm h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            placeholder="请输入关键词，例如：周杰伦 或 晴天"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            className="h-12 px-5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            onClick={handleSearch}
          >
            搜索
          </button>
        </div>

        {/* 搜索类型：与搜索框左对齐 */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              className={[
                tabBase,
                activeType === t
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50",
              ].join(" ")}
              onClick={() => setActiveType(t)}
              aria-pressed={activeType === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 结果区：给左上角搜索容器留出空间，避免重叠 */}
      {results && showResults && (
        // 歌手卡片
        <div className="pt-40 pl-4 space-y-3">
          {(() => {
            const best_match_singer = results.find(
              (i) => i.blockCode === "search_block_best_match"
            );
            const singer = best_match_singer?.resources.find(
              (i) => i.resourceName === "歌手"
            );
            // 如果没有找到歌手信息，不显示歌手卡片
            if (!singer) {
              return null;
            }
            return (
              <div
                className="bg-white rounded-xl shadow-lg p-6 max-w-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => {
                  // 点击事件内容由用户编写
                  console.log(
                    "点击了歌手卡片:",
                    singer?.baseInfo.artistDTO?.name
                  );
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="rounded-full overflow-hidden w-[100px] h-[100px] shadow-lg">
                      <Image
                        width={100}
                        height={100}
                        alt={singer?.baseInfo.artistDTO?.name}
                        src={singer?.baseInfo.artistDTO?.img1v1Url}
                        className="rounded-full object-cover"
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNGNUY1RjUiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOUI5QkEwIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0wLTRjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNCIvPgo8L3N2Zz4KPC9zdmc+"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {singer?.baseInfo.artistDTO?.name}
                    </h2>
                    {singer?.baseInfo.artistDTO?.alias.map((item, index) => (
                      <p className="text-gray-600 text-sm mb-1" key={index}>
                        {item}
                      </p>
                    ))}
                    <div className="flex gap-10">
                      <div className="text-left">
                        <div className="text-lg font-semibold text-blue-600">
                          {singer?.baseInfo.artistDTO?.musicSize || "0"}
                        </div>
                        <div className="text-sm text-gray-500">单曲</div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-green-600">
                          {singer?.baseInfo.artistDTO?.albumSize || "0"}
                        </div>
                        <div className="text-sm text-gray-500">专辑</div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-purple-600">
                          {singer?.extInfo.fansSize || "0"}
                        </div>
                        <div className="text-sm text-gray-500">粉丝</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <Space direction="vertical" size={16} className="w-full mt-5">
            {/* Title */}
            <div className="flex items-center justify-between">
              <Title level={4} className="m-0">
                歌曲
              </Title>
              <Text
                className=""
              >
                更多
              </Text>
            </div>
            {/* 使用 SongTable 组件 */}
            {(() => {
              const search_block_song = results.find(
                (i) => i.blockCode === "search_block_song"
              );
              if(!search_block_song) return
              const data:Song[] = search_block_song.resources
                .map((item:resourcesDataType)=> item.baseInfo.simpleSongData)
                .filter((song): song is Song => song !== undefined)
              return (
                <SongTable tracks={data} />
              );
            })()}
          </Space>
        </div>
      )}
    </div>
  );
}
