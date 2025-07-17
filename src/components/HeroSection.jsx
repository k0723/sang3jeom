import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          AI로 만드는 <span className="text-blue-600">나만의 굿즈</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          반려동물 사진을 업로드하면 AI가 귀여운 캐릭터로 변환해드려요.<br />
          머그컵, 포스터, 티셔츠 등 다양한 굿즈로 제작할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/goods-maker">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
              지금 시작하기
            </button>
          </Link>
          <Link to="/ranking">
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition">
              인기 굿즈 보기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
} 