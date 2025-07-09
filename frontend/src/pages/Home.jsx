import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ServiceCard from "../components/ServiceCard";
import RankingList from "../components/RankingList";
import Footer from "../components/Footer";
import AutoSlider from '../components/AutoSlider';

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <section className="max-w-5xl mx-auto py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ServiceCard icon="🎨" title="AI 캐릭터 생성" desc="사진을 AI로 캐릭터화" />
        <ServiceCard icon="🛍️" title="굿즈 제작" desc="머그, 포스터, 티셔츠 등" />
        <ServiceCard icon="🏆" title="랭킹 시스템" desc="좋아요 기반 인기 굿즈" />
      </section>
      <section className="my-12">
        <AutoSlider />
      </section>
      <RankingList />
      <Footer />
    </div>
  );
} 