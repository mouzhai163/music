"use client"
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import Image from "next/image";

export default function BannerCarousel() {
  const images = [
    "https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/61571750340/60e3/c9b4/7b19/6adf7c1ca986310fddb6d1efa88d3b0a.jpg",
    "https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/61573183506/1d64/dff0/67cb/5679b21b033d9c6715645af803c936f6.jpg?imageView&quality=89",
    "https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/61657703550/bebf/2396/5b61/22bb8d6818f143c52c1b7c35f6203407.jpg?imageView&quality=89",
    "https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/61691529130/db25/a00e/4418/40a72ef0d6232ac8c9c434e2b9f0a76a.jpg?imageView&quality=89",
    "https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/61658056457/e112/5d3a/9698/aae0a1437f475e94b2bd7d90158a6919.jpg?imageView&quality=89",
  ];

  // 用图片 index 数组追踪每一张图片加载状态
  const [loadedList, setLoadedList] = useState(Array(images.length).fill(false));

  function handleLoad(index: number) {
    setLoadedList((prev) => {
      const arr = [...prev];
      arr[index] = true;
      return arr;
    });
  }

  return (
    <div className="w-full flex justify-center items-center py-8 bg-gray-50 overflow-x-hidden">
      <div className="w-full min-h-[300px]">
        <Swiper
          loop={true}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={3}
          spaceBetween={40}
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[EffectCoverflow, Pagination,Autoplay]}
          className="mySwiper"
          style={{
            height: '300px',
            overflow: 'visible'
          }}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i} className="flex justify-center items-center">
              {/* 骨架屏占位 */}
              {!loadedList[i] && (
                <div className="absolute w-full h-full bg-gray-200 rounded-xl animate-pulse z-10" />
              )}
              <Image
                src={img}
                alt={`banner${i}`}
                className={`rounded-xl border shadow-lg mx-auto w-full aspect-[1080/420] object-cover transition-opacity duration-500 ${loadedList[i] ? "opacity-100" : "opacity-0"}`}
                width={1080}
                height={420}
                onLoad={() => handleLoad(i)}
                draggable={false}
                priority={i === 0} // 让首屏预加载
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
