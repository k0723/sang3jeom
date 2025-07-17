import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from '../components/Navbar';
import { 
  ShoppingCart, 
  Download, 
  Heart, 
  Star, 
  Users, 
  Award,
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  Shield,
  Clock
} from "lucide-react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import mugCupImg from '../assets/mug_cup.jpg';
import tshirtImg from '../assets/t_shirts.png';

const goodsList = [
  { 
    key: "mug", 
    label: "머그컵", 
    price: "3,500원~",
    minQuantity: "50개",
    description: "세라믹 머그컵",
    features: ["고급 세라믹 소재", "식기세척기 사용 가능", "내열성 우수"],
    img: mugCupImg, // import한 이미지 사용
  },
  { 
    key: "tshirt", 
    label: "티셔츠", 
    price: "7,040원~",
    minQuantity: "1개",
    description: "반팔 티셔츠",
    features: ["100% 면 소재", "다양한 사이즈", "내구성 우수"],
    img: tshirtImg, // import한 이미지 사용
  },
  { 
    key: "poster", 
    label: "포스터", 
    price: "2,000원~",
    minQuantity: "10개",
    description: "고화질 포스터",
    features: ["고해상도 인쇄", "다양한 사이즈", "내광성 우수"],
    img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
  },
  { 
    key: "phonecase", 
    label: "폰케이스", 
    price: "4,500원~",
    minQuantity: "50개",
    description: "하드 케이스",
    features: ["충격 흡수", "정밀 커팅", "다양한 기종"],
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"
  },
  { 
    key: "sticker", 
    label: "스티커", 
    price: "1,400원~",
    minQuantity: "100개",
    description: "완칼/반칼 스티커",
    features: ["고품질 PVC", "다양한 사이즈", "내수성 우수"],
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"
  },
  { 
    key: "ecobag", 
    label: "에코백", 
    price: "4,500원~",
    minQuantity: "50개",
    description: "면 에코백",
    features: ["100% 면 소재", "내구성 우수", "환경 친화적"],
    img: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=400&fit=crop"
  },
  { 
    key: "cushion", 
    label: "쿠션", 
    price: "6,000원~",
    minQuantity: "30개",
    description: "데코 쿠션",
    features: ["부드러운 터치", "다양한 사이즈", "세탁 가능"],
    img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
  },
  { 
    key: "keyring", 
    label: "키링/아크릴", 
    price: "5,170원~",
    minQuantity: "50개",
    description: "아크릴 키링",
    features: ["투명한 아크릴", "정밀 레이저 커팅", "내구성 우수"],
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"
  },
];

const benefits = [
  {
    icon: Package,
    title: "소량 제작 가능",
    description: "1개부터 제작 가능한 맞춤형 서비스"
  },
  {
    icon: Truck,
    title: "빠른 배송",
    description: "제작 완료 후 2-3일 내 배송"
  },
  {
    icon: Shield,
    title: "품질 보증",
    description: "100% 품질 검수 후 배송"
  },
  {
    icon: Clock,
    title: "신속 제작",
    description: "평균 5-7일 내 제작 완료"
  }
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function drawCylindricalImage(ctx, img, x, y, w, h, curveTop = 5, curveBottom = 15) {
  const slices = 1000; // 슬라이스 수를 1000으로 늘림
  for (let i = 0; i < slices; i++) {
    const sx = (img.width / slices) * i;
    const sw = img.width / slices;
    const dx = x + (w / slices) * i;
    const theta = ((i + 0.5) / slices - 0.5) * Math.PI;
    const y1 = y - curveTop * (1 - Math.cos(theta));
    const y2 = y + h - curveBottom * (1 - Math.cos(theta));
    ctx.drawImage(
      img,
      sx, 0, sw, img.height,
      dx, y1, w / slices, y2 - y1
    );
  }
}

export default function GoodsMaker() {
  const query = useQuery();
  const aiImg = query.get("img");
  const [selected, setSelected] = useState(goodsList[0]);
  const [quantity, setQuantity] = useState(50);
  const [selectedOptions, setSelectedOptions] = useState({});
  const canvasRef = useRef();
  const [uploadedImg, setUploadedImg] = useState(null);
  const [imgScale, setImgScale] = useState(0.4); // 40%로 시작
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 }); // x, y는 px 단위 오프셋
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const bgRef = useRef(null);
  const fgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const fileInputRef = useRef();

  const [mugImage, setMugImage] = useState(null);
  const [tshirtImage, setTshirtImage] = useState(null);
  // ... 기타 굿즈별 상태

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  useEffect(() => {
    // 굿즈를 바꿀 때마다 파일 input도 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selected]);

  const getCurrentImage = () => {
    switch(selected.key) {
      case 'mug': return mugImage;
      case 'tshirt': return tshirtImage;
      // ... 기타 굿즈
      default: return null;
    }
  };

  useEffect(() => {
    setImgLoaded(false);
    const bg = new window.Image();
    const fg = new window.Image();
    bg.crossOrigin = "anonymous";
    fg.crossOrigin = "anonymous";
    bg.src = selected.img;
    fg.src = getCurrentImage() || aiImg;
    bg.onload = () => {
      fg.onload = () => {
        bgRef.current = bg;
        fgRef.current = fg;
        setImgLoaded(true);
      };
    };
  }, [selected, mugImage, tshirtImage, aiImg]);

  // 굿즈 배경만 그리는 useEffect
  useEffect(() => {
    if (uploadedImg || aiImg) return; // 합성 이미지가 있으면 기존 로직이 처리
    if (!selected) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    bg.src = selected.img;
    bg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 비율 유지 중앙 정렬
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = bg.width / bg.height;
      let bgW, bgH, bgX, bgY;
      if (imgRatio > canvasRatio) {
        bgH = canvas.height;
        bgW = canvas.height * imgRatio;
        bgX = (canvas.width - bgW) / 2;
        bgY = 0;
      } else {
        bgW = canvas.width;
        bgH = canvas.width / imgRatio;
        bgX = 0;
        bgY = (canvas.height - bgH) / 2;
      }
      ctx.drawImage(bg, bgX, bgY, bgW, bgH);
    };
  }, [selected, uploadedImg, aiImg]);

  useEffect(() => {
    if (!imgLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bg = bgRef.current;
    const fg = fgRef.current;

    // 배경 비율 계산
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = bg.width / bg.height;
    let bgW, bgH, bgX, bgY;

    if (imgRatio > canvasRatio) {
      // 배경이 더 가로로 김: 높이에 맞추고 좌우 여백
      bgH = canvas.height;
      bgW = bg.height * imgRatio;
      bgW = canvas.height * imgRatio;
      bgX = (canvas.width - bgW) / 2;
      bgY = 0;
    } else {
      // 배경이 더 세로로 김: 너비에 맞추고 상하 여백
      bgW = canvas.width;
      bgH = canvas.width / imgRatio;
      bgX = 0;
      bgY = (canvas.height - bgH) / 2;
    }

    ctx.drawImage(bg, bgX, bgY, bgW, bgH);

    // 굿즈 종류별로 위치/크기 다르게
    let x, y, w, h;
    if (selected.key === 'mug') {
      w = canvas.width * 0.4 * imgScale; // 40%로 줄임
      h = w;
      x = (canvas.width - w) / 2 + imgOffset.x;
      y = canvas.height * 0.35 + imgOffset.y;

      // 비율 유지하며 drawImage
      const imgRatio = fg.width / fg.height;
      let drawW = w, drawH = h;
      if (imgRatio > 1) {
        drawH = w / imgRatio;
        y += (h - drawH) / 2;
      } else {
        drawW = h * imgRatio;
        x += (w - drawW) / 2;
      }
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.10)"; // 약한 그림자
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.92; // 약간 투명
      ctx.globalCompositeOperation = "multiply"; // 컵과 자연스럽게 섞임
      drawCylindricalImage(ctx, fg, x, y, w, h, 10, 20); // 윗변 10, 아랫변 20
      ctx.globalCompositeOperation = "source-over"; // 원래대로 복구
      ctx.restore();
    } else if (selected.key === 'tshirt') {
      // 인쇄 영역 계산 (기존 코드)
      const tshirtArea = {
        x: canvas.width * 0.25,
        y: canvas.height * 0.28,
        w: canvas.width * 0.5,
        h: canvas.height * 0.5,
      };

      // 비율 유지하여 이미지 크기/위치 계산 (기존 코드)
      let imgW = tshirtArea.w * imgScale;
      let imgH = imgW * (fg.height / fg.width);
      if (imgH > tshirtArea.h * imgScale) {
        imgH = tshirtArea.h * imgScale;
        imgW = imgH * (fg.width / fg.height);
      }
      const imgX = tshirtArea.x + (tshirtArea.w - imgW) / 2 + imgOffset.x;
      const imgY = tshirtArea.y + (tshirtArea.h - imgH) / 2 + imgOffset.y;

      // 1. 그림자 효과 (선택)
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.08)";
      ctx.shadowBlur = 6;
      ctx.drawImage(fg, imgX, imgY, imgW, imgH);
      ctx.restore();

      // 2. 블렌드 모드 + 투명도
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(fg, imgX, imgY, imgW, imgH);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // 3. 섬유 질감 강조 (티셔츠 이미지를 위에 살짝 덮기)
      ctx.save();
      ctx.globalAlpha = 0.12; // 질감 강조용
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    } else {
      // 기타 굿즈별 위치/크기 (필요시 추가)
      w = canvas.width * 0.5 * imgScale;
      h = w;
      x = (canvas.width - w) / 2 + imgOffset.x;
      y = (canvas.height - h) / 2 + imgOffset.y;
      ctx.drawImage(fg, x, y, w, h);
    }
  }, [imgLoaded, imgScale, imgOffset, selected]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      switch(selected.key) {
        case 'mug': setMugImage(url); break;
        case 'tshirt': setTshirtImage(url); break;
        // ... 기타 굿즈
      }
    }
  };

  const handleCanvasMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.nativeEvent.offsetX - dragStart.x;
    const dy = e.nativeEvent.offsetY - dragStart.y;
    setImgOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${selected.label}_굿즈.png`;
    link.click();
  };

  const calculatePrice = () => {
    const basePrice = parseInt(selected.price.replace(/[^0-9]/g, ''));
    return (basePrice * quantity).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-800">홈으로 돌아가기</span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">상상상점 AI 굿즈 제작</h1>
              <p className="text-sm text-gray-600">당신만의 특별한 굿즈를 만들어보세요</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Goods Selection */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
              data-aos="fade-right"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">굿즈 선택</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {goodsList.map((item) => (
                  <motion.button
                    key={item.key}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selected.key === item.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelected(item)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img 
                      src={item.img} 
                      alt={item.label} 
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-600">{item.price}</div>
                  </motion.button>
                ))}
              </div>

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  수량 선택
                </label>
                <select 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1개</option>
                  <option value={10}>10개</option>
                  <option value={50}>50개</option>
                  <option value={100}>100개</option>
                  <option value={200}>200개</option>
                  <option value={500}>500개</option>
                </select>
              </div>

              {/* Price Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">예상 가격</span>
                  <span className="text-lg font-bold text-blue-600">{calculatePrice()}원</span>
                </div>
                <div className="text-xs text-gray-500">
                  * 정확한 견적은 상담 후 안내드립니다
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <motion.button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  주문하기
                </motion.button>
                <motion.button
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  상담 문의하기
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Preview Section */}
            <div className="flex flex-col items-center min-h-[420px] justify-center bg-gray-50 rounded-xl shadow mb-4 border">
              {/* 미리보기 영역 렌더링 부분 */}
              <>
                <div className="flex items-center gap-2 my-2">
                  <label className="text-sm text-gray-700">이미지 크기</label>
                  <input
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.01"
                    value={imgScale}
                    onChange={e => setImgScale(Number(e.target.value))}
                    className="w-40"
                  />
                  <span className="text-xs text-gray-500">{Math.round(imgScale * 100)}%</span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={640}      // 16:9 비율 예시
                  height={358}
                  className="rounded-xl"
                  style={{ width: '100%', height: 'auto' }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                {!(uploadedImg || aiImg) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg py-20 pointer-events-none">
                  </div>
                )}
              </>
            </div>

            {/* AI Image Upload */}
            <div className="mb-6 flex flex-col items-center">
              <label className="block mb-2 text-gray-700 font-semibold">AI 캐릭터 이미지 업로드 (테스트용)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">AI 캐릭터 이미지를 업로드하면 굿즈에 합성됩니다.</p>
            </div>

            {/* Product Details */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-up"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">제품 상세 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">제품 특징</h3>
                  <ul className="space-y-2">
                    {selected.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">제작 정보</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>최소 주문 수량:</span>
                      <span className="font-semibold">{selected.minQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>제작 기간:</span>
                      <span className="font-semibold">5-7일</span>
                    </div>
                    <div className="flex justify-between">
                      <span>배송 기간:</span>
                      <span className="font-semibold">2-3일</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Benefits Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-up"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">서비스 혜택</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <benefit.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-up"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">고객 후기</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    "퀄리티가 정말 좋아요! AI로 만든 캐릭터가 너무 귀엽게 나왔습니다."
                  </p>
                  <div className="text-sm text-gray-500">- 김**님 (티셔츠 제작)</div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    "빠른 제작과 배송에 만족합니다. 다음에도 이용할 예정이에요!"
                  </p>
                  <div className="text-sm text-gray-500">- 이**님 (머그컵 제작)</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 