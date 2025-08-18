"use client";
import axios from "axios";
import React, {useState } from "react";
import ResultAll from "@/app/components/Search/ResultAll";
import ResultSong from "@/app/components/Search/ResultSong";
import ResultSinger from "@/app/components/Search/ResultSinger";

export default function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [activeType, setActiveType] = useState<
    "综合" | "歌手" | "歌曲" | "专辑" | "歌单"
  >("综合");
  const [results, setResults] = useState();
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const fecthData = async (q: string, type?: typeof activeType) => {
    // 使用传入的 type 参数，如果没有则使用当前的 activeType
    const currentType = type || activeType;
    const urlMap: Record<typeof activeType, string> = {
      综合: `/api/compleSearch`,
      歌手: `/api/searchSingerBySingerName`,
      歌曲: `/api/Search`,
      专辑: `/api/search/album`,
      歌单: `/api/search/playlist`,
    };
    setLoading(true);
    setResults(undefined);
    try {
      const res = await axios.post(urlMap[currentType], {
        keyword: q,
      });
      if (res.status === 200) {
        // 先触发动画，再设置数据
        setShowResults(true);
        // 延迟设置数据，让动画先开始
        setTimeout(() => {
          setResults(res.data.data);
          setLoading(false);
        }, 600); // 动画进行到一半时加载数据
      } else {
        throw new Error("Search - API接口异常!");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const q = searchValue.trim();
    if (!q) return;
    fecthData(q);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 处理歌手卡片点击，跳转到歌曲搜索
  const handleSingerCardClick = (singerName: string) => {
    // 设置搜索词为歌手名
    setSearchValue(singerName);
    // 切换到歌曲类型
    setActiveType("歌曲");
    // 触发歌曲搜索
    fecthData(singerName, "歌曲");
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

  // 核心：根据 showResults 切换位置（中间略偏上 -> 左上角）
  const searchWrapStyle: React.CSSProperties = showResults
    ? {
        top: 16,
        left: 16,
        transform: "translate(0, 0) scale(0.98)",
        willChange: "transform",
      }
    : {
        top: "35%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(1)",
        willChange: "transform",
      };

  return (
    <div className="relative min-h-screen p-4">
      {/* 可移动搜索容器 */}
      <div
        className="absolute w-full max-w-2xl transition-all duration-500 ease-in-out"
        style={searchWrapStyle}
      >
        <div className="mb-3 text-gray-700">搜索歌手或歌曲名</div>

        {/* 搜索框行（保持中间展示；有结果时它整体会平移到左上角） */}
        <div className="flex items-center gap-3">
          <input
            className="flex-1 max-w-sm h-12 px-4 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            placeholder="请输入关键词，例如：许嵩 或 邓紫棋"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyPress}
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
              onClick={() => {
                setActiveType(t);
                const q = searchValue.trim();
                if (!q) {
                  setLoading(true)
                  return
                };
                // 传递目标类型 t，而不是依赖当前的 activeType
                fecthData(q, t);
              }}
              aria-pressed={activeType === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 结果区：给左上角搜索容器留出空间，避免重叠 */}
      {results && showResults && (
        <div className="pt-40 pl-4 pr-4">
          {!loading && activeType === "综合" && <ResultAll data={results} />}
          {!loading && activeType === "歌手" && <ResultSinger data={results} onSingerClick={handleSingerCardClick} />}
          {!loading && activeType === "歌曲" && <ResultSong data={results} />}
          {/* {activeType === "专辑" && <ResultAlbum data={results} />} */}
          {/* {activeType === "歌单" && <ResultPlaylist data={results} />} */}
        </div>
      )}
    </div>
  );
}
