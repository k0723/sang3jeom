import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

const cards = [
  { 
    title: "스티커 제작", 
    desc: "다양한 스티커를 소량부터 제작", 
    img: "https://placehold.co/300x300/4F46E5/FFFFFF?text=스티커",
    price: "최소 1,000원~"
  },
  { 
    title: "아크릴 키링", 
    desc: "NFC, 커스텀 등 다양한 키링", 
    img: "https://placehold.co/300x300/10B981/FFFFFF?text=키링",
    price: "최소 5,000원~"
  },
  { 
    title: "트럼프 카드", 
    desc: "나만의 디자인 카드 제작", 
    img: "https://placehold.co/300x300/F59E0B/FFFFFF?text=카드",
    price: "최소 3,000원~"
  },
  { 
    title: "패브릭 굿즈", 
    desc: "포근포근 귀여운 인형 굿즈", 
    img: "https://placehold.co/300x300/EC4899/FFFFFF?text=인형",
    price: "최소 8,000원~"
  },
  { 
    title: "데스크 굿즈", 
    desc: "오피스에 감성을 더하는 굿즈", 
    img: "https://placehold.co/300x300/8B5CF6/FFFFFF?text=데스크",
    price: "최소 2,000원~"
  },
  { 
    title: "아크릴 굿즈", 
    desc: "퀄리티 좋은 아크릴 제품", 
    img: "https://placehold.co/300x300/06B6D4/FFFFFF?text=아크릴",
    price: "최소 4,000원~"
  }
];

export default function AutoSlider() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        인기 굿즈 카테고리
      </h2>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={24}
        slidesPerView={1.2}
        loop={true}
        autoplay={{ 
          delay: 3000, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        breakpoints={{
          640: {
            slidesPerView: 2.2,
          },
          768: {
            slidesPerView: 3.2,
          },
          1024: {
            slidesPerView: 4.2,
          },
        }}
        className="w-full"
      >
        {cards.map((card, idx) => (
          <SwiperSlide key={idx}>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <img 
                  src={card.img} 
                  alt={card.title} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{card.desc}</p>
                <p className="text-indigo-600 font-semibold">{card.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
} 