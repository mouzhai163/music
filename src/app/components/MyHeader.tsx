'use client'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button } from 'antd';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MyHeader() {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();

  // 处理搜索提交
  const handleSearch = () => {
    const query = searchValue.trim();
    if (!query) return;
    
    // 跳转到搜索页面，并传递搜索参数
    router.push(`/search?q=${encodeURIComponent(query)}&type=综合`);
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  return (
    <div className='flex justify-between h-16 text-center'>
      {/* 导航栏左侧 logo和搜索框 */}
      <div className='flex justify-center items-center'>
        <div className='w-60'>
          Logo占位符
        </div>
        <div className='relative'>
          <SearchOutlined 
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 cursor-pointer hover:text-blue-500 transition-colors' 
            onClick={handleSearch}
          />
          <input
            type="text"
            value={searchValue}
            placeholder='搜索...'
            className={`h-8 rounded-2xl px-7 outline-none bg-[#E3E3E3] transition-all duration-300 ease-in-out ${isSearchFocused
              ? 'w-70 border-2 border-blue-500 shadow-lg'
              : 'w-48 border-2 border-transparent'
              }`}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>
      <div className='flex items-center ml-auto mr-20'>
        <Button type='primary' className='!rounded-2xl' icon={<UserOutlined />}>登录</Button>
      </div>
    </div>
  )
}
