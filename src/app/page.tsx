import BannerCarousel from "./components/BannerCarousel";
import RecommendPlayList from "./components/RecommendPlayList";
import RecommendSongs from "./components/RecommendSongs";

export default function Page() {
  return (
    <>
      {/* 幻灯片 */}
      <BannerCarousel />
      {/* 推荐歌单 */}
      <RecommendPlayList />
      {/* 推荐歌曲 */}
      <RecommendSongs />
    </>
  );
}