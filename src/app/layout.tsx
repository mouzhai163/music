import React from 'react'
import type { Metadata } from "next";
import { ZCOOL_KuaiLe } from 'next/font/google'
import "./globals.css";

const zcoolKuaiLe = ZCOOL_KuaiLe({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

import { AntdRegistry } from '@ant-design/nextjs-registry';

import SideMenu from './components/SideMenu';
import MyHeader from "./components/MyHeader";
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: "MZ在线音乐",
  description: "音乐，是心灵的语言",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="zh-CN">
      <body className={zcoolKuaiLe.className}>
        <AntdRegistry>
          <div className="min-h-screen bg-gray-50">
            <header className="h-16 bg-[#F5F5F5] border-b border-gray-200">
              <MyHeader />
            </header>

            {/* Main Content Area */}
            <div className="flex h-[calc(100vh-64px-100px)]">
              {/* Sidebar */}
              <aside className="w-[14%] 2xl:w-[10%] bg-[#F9F9F9]">
                <SideMenu />
              </aside>

              {/* Main Content */}
              <main className="flex-1 bg-[#F8F8F8] p-6 overflow-auto">
                {children}
              </main>
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}
