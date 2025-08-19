import { Album } from '@/types/album'
import Image from "next/image";
import React from 'react'
import { Disc } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResultAlbumProps{
  result:{
    albums:Album[]
  },
  code:number
}

function AlbumCard({ album }: { album: Album }) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/album/${album.id}`);
  };

  return (
    <div 
      className="w-56 shadow-md rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white cursor-pointer transform"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-56">
        <Image
          src={album.picUrl}
          alt={album.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-pink-500" />
          <div className="text-sm font-semibold truncate">{album.name}</div>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {album.artist?.name} · {album.company || "未知公司"}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(album.publishTime).toLocaleDateString("zh-CN")}
        </p>
      </div>
    </div>
  );
}


export default function ResultAlbum({data}:{data:ResultAlbumProps}) {
  const albums = data.result.albums
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
    </div>
  )
}
