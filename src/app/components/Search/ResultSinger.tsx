import React from 'react'
import Image from 'next/image'

type Artist = {
  id: number
  name: string
  picUrl: string
  alias: string[]
  albumSize: number
  mvSize: number
  followed: boolean
  accountId?: number
  identityIconUrl?: string
}
type searchSinger = {
  result: {
    artists: Artist[]
  }
}

/** 歌手卡片 */
function ArtistCard({ artist, onClick }: { artist: Artist; onClick: (singerName: string) => void }) {
  return (
    <div 
      className="w-64 rounded-2xl shadow-md bg-white p-4 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer transform"
      onClick={() => onClick(artist.name)}
    >
      {/* 歌手头像 */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100">
        {artist.picUrl ? (
          <Image
            src={artist.picUrl}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => {
              // 图片加载失败时的处理
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : null}
        
        {/* 默认头像占位符 */}
        {!artist.picUrl && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-2xl text-white">🎤</span>
              </div>
              <p className="text-sm text-gray-600">暂无头像</p>
            </div>
          </div>
        )}
      </div>

      {/* 歌手信息 */}
      <div className="mt-4 space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {artist.name}
          {artist.alias?.length > 0 && (
            <span className="text-sm text-gray-500">({artist.alias[0]})</span>
          )}
        </h2>

        <p className="text-sm text-gray-600">
          专辑: {artist.albumSize} · MV: {artist.mvSize}
        </p>

      </div>
    </div>
  )
}

/** 歌手列表 */
function ArtistList({ artists, onSingerClick }: { artists: Artist[]; onSingerClick: (singerName: string) => void }) {
  if (!artists || artists.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-10">暂无歌手数据</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6
                gap-4 sm:gap-5 md:gap-6 lg:gap-8 p-4 sm:p-6">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} onClick={onSingerClick} />
      ))}
    </div>
  )
}

interface ResultSingerProps {
  data: searchSinger;
  onSingerClick: (singerName: string) => void;
}

export default function ResultSinger({data, onSingerClick}: ResultSingerProps) {
  const artists = data.result.artists
  return (
    <>
      <div className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold p-6">歌手列表</h1>
      <ArtistList artists={artists} onSingerClick={onSingerClick} />
    </div>
    </>
  )
}
