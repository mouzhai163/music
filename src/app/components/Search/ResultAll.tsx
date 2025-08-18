import React from "react";
import { Col, Image, Row, Space, Typography } from "antd";
import SongTable from "@/app/components/SongTable";
import { Song } from "@/types/album";
import { blockDataType, compleSearchDataType, resourcesDataType } from "@/types/compleSearch";

const { Title, Text } = Typography;

interface ResultAllProps {
  data: compleSearchDataType;
}

const ResultAll: React.FC<ResultAllProps> = ({ data }) => {
  // 综合搜索：过滤blocks数据
  const allowBlocks = ["search_block_best_match", "search_block_song"];
  const blocks = data.blocks;
  const visibleBlocks = blocks.filter(
    (block: blockDataType) =>
      typeof block?.blockCode === "string" &&
      allowBlocks.includes(block.blockCode) &&
      Array.isArray(block.resources) &&
      block.resources.length > 0
  );
  return (
    <div className="space-y-6">
      {/* 歌手卡片 - 最佳匹配 */}
      {(() => {
        const best_match_singer = visibleBlocks.find(
          (i: blockDataType) => i.blockCode === "search_block_best_match"
        );
        const singer = best_match_singer?.resources.find(
          (i: resourcesDataType) => i.resourceName === "歌手"
        );
        if (!singer) return null;

        return (
          <div>
            <Row gutter={36}>
              <Col sm={24} md={24} lg={12} xl={9} xxl={5}>
                <div
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => {
                    // 点击事件
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
                      {singer?.baseInfo.artistDTO?.alias.map(
                        (item: string, index: number) => (
                          <span className="text-gray-600 text-xs mb-1 mr-2" key={index}>
                            {item}
                          </span>
                        )
                      )}
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
              </Col>
            </Row>
          </div>
        );
      })()}

      {/* 歌曲列表 */}
      {(() => {
        const search_block_song = visibleBlocks.find(
          (i: blockDataType) => i.blockCode === "search_block_song"
        );
        if (!search_block_song) return null;

        const songs: Song[] = search_block_song.resources
          .map((item: resourcesDataType) => item.baseInfo.simpleSongData)
          .filter((song: Song | undefined): song is Song => song !== undefined);

        return (
          <Space direction="vertical" size={16} className="w-full">
            <div className="flex items-center justify-between">
              <Title level={4} className="m-0">
                热门歌曲
              </Title>
              <Text>
                <a href="#">更多</a>
              </Text>
            </div>
            <SongTable tracks={songs} />
          </Space>
        );
      })()}
    </div>
  );
};

export default ResultAll;
