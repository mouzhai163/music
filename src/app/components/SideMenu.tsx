'use client'

import React from 'react'
import { Disc3,House ,Search,ListMusic,Heart,User} from 'lucide-react';
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'

const menuItems = [
  { label: '推荐', icon: <House />, key: '/' },
  { label: '搜索', icon: <Search />, key: '/search', group: '发现' },
  { label: '歌单', icon: <ListMusic />, key: '/playlist', group: '发现' },
  { label: '专辑', icon: <Disc3 />, key: '/album', group: '发现' },
  { label: '喜欢', icon: <Heart />, key: '/favorites', group: '我的' },
  { label: '个人中心', icon: <User />, key: '/profile', group: '我的' },
]

export default function SideMenu() {
  const pathname = usePathname()

  // 分组
  const grouped = menuItems.reduce((acc, item) => {
    const group = item.group ?? ''
    acc[group] = acc[group] ?? []
    acc[group].push(item)
    return acc
  }, {} as Record<string, typeof menuItems>)

  return (
    <div className="px-4 pt-3 text-xl">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-4">
          {group && <div className="text-sm text-gray-500 mb-2">{group}</div>}
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.key}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    pathname === item.key
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}