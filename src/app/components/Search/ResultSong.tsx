import { SearchData } from '@/types/search_result'
import React from 'react'
import SongTable from '../SongTable'

export default function ResultSong({data}: {data:SearchData }) {
  const tracks = data.resources.map((r) => r.baseInfo.simpleSongData);

  return (
    <>
      <SongTable tracks={tracks}/>
    </>
  )
}
