import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  ShoppingBag, 
  Palette, 
  Star, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  // 로그인 체크 함수
  const requireLogin = (callback) => {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
      alert('로그인이 필요합니다!');
      navigate('/login');
      return;
    }
    callback();
  };

  const goodsCategories = [
    {
      id: 1,
      name: '스티커',
      icon: '🎯',
      description: '완칼/반칼 스티커',
      price: '1,400원~',
      minQuantity: '100개',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: '키링',
      icon: '🔑',
      description: '아크릴 키링',
      price: '5,170원~',
      minQuantity: '50개',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: '티셔츠',
      icon: '👕',
      description: '반팔 티셔츠',
      price: '7,040원~',
      minQuantity: '1개',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: '머그컵',
      icon: '☕',
      description: '세라믹 머그컵',
      price: '3,500원~',
      minQuantity: '50개',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      name: '포스터',
      icon: '🖼️',
      description: '고화질 포스터',
      price: '2,000원~',
      minQuantity: '10개',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      name: '에코백',
      icon: '👜',
      description: '면 에코백',
      price: '4,500원~',
      minQuantity: '50개',
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=300&fit=crop'
    }
  ];

  const portfolioItems = [
    {
      id: 1,
      title: '롯데월드 캐릭터굿즈',
      category: '캐릭터굿즈',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
      description: '마그넷 제작'
    },
    {
      id: 2,
      title: '카카오엔터테인먼트',
      category: '사내굿즈',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      description: '웰컴키트 패키지'
    },
    {
      id: 3,
      title: 'T1 게임굿즈',
      category: '게임굿즈',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      description: '금속 뱃지, 키링'
    },
    {
      id: 4,
      title: '서울시 교육청',
      category: '캐릭터굿즈',
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=300&fit=crop',
      description: '인형키링'
    }
  ];

  const partners = [
    '넥슨', 'SM Entertainment', 'JYP', 'T1', '롯데월드', 
    '대원씨아이', '포켓몬 코리아', 'KRAFTON', 'TikTok', '아프리카tv'
  ];

  const stats = [
    { number: '10,000+', label: '제작 완료', icon: ShoppingBag },
    { number: '500+', label: '기업 파트너', icon: Users },
    { number: '4.9', label: '고객 만족도', icon: Star },
    { number: '15년', label: '제작 경력', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white opacity-5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white opacity-8 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
                      <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              상상상점에서
              <br />
              <span className="text-yellow-300">굿즈로 변신</span>시키는 마법!
            </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            AI 캐릭터 생성부터 굿즈 제작까지, 모든 과정을 한 번에!
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button 
              className="bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => requireLogin(() => navigate('/character-maker'))}
            >
              AI 캐릭터 만들기
            </motion.button>
            <motion.button 
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => requireLogin(() => navigate('/goods-maker'))}
            >
              굿즈 제작하기
            </motion.button>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowRight className="w-6 h-6 text-white rotate-90" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Goods Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            data-aos="fade-up"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">FOR YOU</h2>
            <p className="text-xl text-gray-600">상상상점의 맞춤 제안</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goodsCategories.map((item, index) => (
              <motion.div 
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl">{item.icon}</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">최소 {item.minQuantity}</div>
                    <div className="text-lg font-bold text-blue-600">{item.price}</div>
                  </div>
                  
                  <Link to="/goods-maker">
                    <motion.button 
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      제작하기
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            data-aos="fade-up"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">포트폴리오</h2>
            <p className="text-xl text-gray-600">다양한 고객이 상상상점을 믿고 선택했어요</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {portfolioItems.map((item, index) => (
              <motion.div 
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-semibold mb-2">{item.category}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            data-aos="fade-up"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">상상상점과 함께한 파트너들</h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {partners.map((partner, index) => (
              <motion.div 
                key={index}
                className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="text-lg font-semibold text-gray-700">{partner}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div 
            data-aos="fade-up"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              굿즈 추천부터 제작까지<br />
              상상상점과 함께
            </h2>
            <p className="text-xl text-white/90 mb-8">
              1:1 전담 매니저가 매칭되어 예산, 납기일, 수량, 컨셉에 맞는 굿즈를 추천드립니다.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                className="bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                굿즈 문의하기 💡
              </motion.button>
              <motion.button 
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                뉴스레터 구독 💌
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">상상상점</h3>
              <p className="text-gray-400 mb-4">
                All in one for GOODS Production
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  070-4138-2111
                </div>
                                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    info@sangsangsangjeom.com
                  </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  서울시 마포구 성미산로80 4층
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>스티커 제작</li>
                <li>키링 제작</li>
                <li>티셔츠 제작</li>
                <li>머그컵 제작</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li>회사소개</li>
                <li>이용약관</li>
                <li>개인정보처리방침</li>
                <li>사업자등록증</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>문의하기</li>
                <li>견적요청</li>
                <li>제작가이드</li>
                <li>자주묻는질문</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>법인명 (주)상상상점 | 대표이사 홍길동 | 사업자등록번호 123-45-67890</p>
            <p className="mt-2">본 사이트의 모든 정보, 콘텐츠, UI 등에 대한 무단 복제, 전송, 배포, 스크래핑 등의 행위는 관련 법령에 의하여 엄격히 금지됩니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 