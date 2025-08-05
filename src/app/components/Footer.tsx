"use client"
import React from 'react'

import Player from "@/components/music/MusicLayout";

export default function Footer() {
  return (
    <footer className="h-[100px] bg-white border-t border-gray-200 shadow-lg backdrop-blur-sm">
      <Player />
    </footer>
  )
}
