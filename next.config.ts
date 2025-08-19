import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.music.126.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "**.music.126.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      // 代理网易云音乐下载链接，解决跨域问题
      {
        source: '/proxy/music/:path*',
        destination: 'http://m704.music.126.net/:path*',
      },
      {
        source: '/proxy/music2/:path*', 
        destination: 'http://m804.music.126.net/:path*',
      },
    ];
  },
  output: "standalone",
};

export default nextConfig;
