import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
import tShirtImg from '../assets/t_shirts.png';
import echoBagImg from '../assets/echo_bag.png';
import caseImg from '../assets/case.png';

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
    img: tShirtImg
  },
  { 
    key: "ecobag", 
    label: "에코백", 
    price: "4,500원~",
    minQuantity: "50개",
    description: "면 에코백",
    features: ["100% 면 소재", "내구성 우수", "환경 친화적"],
    img: echoBagImg
  },
  {
    key: "case",
    label: "폰케이스",
    price: "4,500원~",
    minQuantity: "50개",
    description: "하드 케이스",
    features: ["충격 흡수", "정밀 커팅", "다양한 기종"],
    img: caseImg
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

function drawCylindricalImage(ctx, img, x, y, w, h, curve = 20) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 3;
  ctx.globalAlpha = 0.95;
  ctx.globalCompositeOperation = "multiply";
  ctx.filter = "saturate(90%) brightness(98%)";

  // 간단하고 안정적인 원통형 렌더링
  const slices = 200;
  const sliceWidth = w / slices;
  
  for (let i = 0; i < slices; i++) {
    const ratio = i / (slices - 1);
    const sourceX = img.width * ratio;
    const sourceWidth = img.width / slices;
    
    // 원통형 왜곡 - 세로 위치만 조정
    const offsetRatio = (ratio - 0.5) * 2;
    const yOffset = -curve * Math.pow(offsetRatio, 2);
    
    const destX = x + i * sliceWidth;
    const destY = y + yOffset;
    const destWidth = sliceWidth;
    const destHeight = h; // 세로 높이는 고정
    
    ctx.drawImage(
      img,
      sourceX, 0, sourceWidth, img.height,
      destX, destY, destWidth, destHeight
    );
  }

  ctx.restore();
  ctx.filter = "none";
}

// uploadedImg가 File/Blob이면 URL.createObjectURL, string이면 그대로 사용
const getImageSrc = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  return URL.createObjectURL(img);
};


export default function GoodsMaker() {
  const query = useQuery();
  const aiImg = query.get("img");
  const [selected, setSelected] = useState(goodsList[0]);
  const [quantity, setQuantity] = useState(50);
  const [selectedOptions, setSelectedOptions] = useState({});
  const canvasRef = useRef();
  const [uploadedImg, setUploadedImg] = useState(null);
  const [imgScale, setImgScale] = useState(1); // 1 = 100%
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 }); // x, y는 px 단위 오프셋
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const bgRef = useRef(null);
  const fgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [aiImages, setAiImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const userId = 1; // 하드코딩된 유저 ID
  const abortControllerRef = useRef(null); // 이미지 로딩 중단용

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  useEffect(() => {
    setImgLoaded(false);
    const bg = new window.Image();
    const fg = new window.Image();
    bg.crossOrigin = "anonymous";
    fg.crossOrigin = "anonymous";
    bg.src = selected.img;
    fg.src = uploadedImg || aiImg;
    bg.onload = () => {
      fg.onload = () => {
        bgRef.current = bg;
        fgRef.current = fg;
        setImgLoaded(true);
      };
    };
  }, [uploadedImg, aiImg, selected]);

  useEffect(() => {
    const fetchImages = async () => {
      console.log("AI 이미지 불러오기 시작, userId:", userId);
      
      const jwt = sessionStorage.getItem("jwt");
      console.log("JWT 토큰:", jwt ? "존재함" : "없음");
      
      try {
        let token = null;
        if (jwt) {
          if (jwt.startsWith("{")) {
            token = JSON.parse(jwt).token;
            console.log("JWT 객체에서 토큰 추출됨");
          } else {
            token = jwt;
          }
        }
        
        console.log("API 호출:", `/api/ai-images/user/${userId}`);
        
        // 헤더 설정
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch(`/api/ai-images/user/${userId}`, {
          headers: headers
        });
        
        console.log("API 응답 상태:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("AI 이미지 데이터:", data);
          setAiImages(data);
        } else {
          console.error("AI 이미지 불러오기 실패:", res.status);
          const errorText = await res.text();
          console.error("에러 내용:", errorText);
        }
      } catch (error) {
        console.error("AI 이미지 불러오기 오류:", error);
      }
    };
    fetchImages();
  }, [userId]);

  // 통합된 캔버스 렌더링 useEffect
  useEffect(() => {
    // 진행 중인 이미지 로딩 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // 캔버스 즉시 비우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 이미지 로드
    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    bg.src = selected.img;
    
    bg.onload = () => {
      // AbortController로 중단되었는지 확인
      if (abortControllerRef.current?.signal.aborted) return;
      
      // 배경 그리기 (비율 맞춤)
      const imgRatio = bg.width / bg.height;
      const canvasRatio = canvas.width / canvas.height;
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
      
      // uploadedImg가 있으면 합성 이미지도 그리기
      if (uploadedImg) {
        const fg = new window.Image();
        fg.crossOrigin = "anonymous";
        fg.src = uploadedImg;
        
        fg.onload = () => {
          // AbortController로 중단되었는지 확인
          if (abortControllerRef.current?.signal.aborted) return;
          
          // 굿즈별 합성 효과
          if (selected.key === "mug") {
            drawCylindricalImage(
              ctx,
              fg,
              canvas.width * 0.28 + imgOffset.x,
              canvas.height * 0.22 + imgOffset.y,
              canvas.width * 0.44 * imgScale,
              canvas.height * 0.56 * imgScale,
              20
            );
          } else if (selected.key === "tshirt") {
            ctx.save();
            ctx.globalAlpha = 0.92;
            ctx.globalCompositeOperation = "multiply";
            ctx.shadowColor = "rgba(0,0,0,0.10)";
            ctx.shadowBlur = 8;
            const fgW = canvas.width * 0.38 * imgScale;
            const fgH = canvas.height * 0.38 * imgScale;
            const fgX = canvas.width * 0.31 + imgOffset.x;
            const fgY = canvas.height * 0.22 + imgOffset.y;
            ctx.drawImage(fg, fgX, fgY, fgW, fgH);
            ctx.restore();
          } else if (selected.key === "ecobag") {
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.globalCompositeOperation = "multiply";
            ctx.shadowColor = "rgba(0,0,0,0.08)";
            ctx.shadowBlur = 6;
            const fgW = canvas.width * 0.32 * imgScale;
            const fgH = canvas.height * 0.38 * imgScale;
            const fgX = canvas.width * 0.34 + imgOffset.x;
            const fgY = canvas.height * 0.28 + imgOffset.y;
            ctx.drawImage(fg, fgX, fgY, fgW, fgH);
            ctx.restore();
          } else if (selected.key === "case") {
            ctx.save();
            ctx.globalAlpha = 0.98;
            ctx.globalCompositeOperation = "multiply";
            ctx.shadowColor = "rgba(0,0,0,0.10)";
            ctx.shadowBlur = 4;
            const printX = canvas.width * 0.41 + imgOffset.x;
            const printY = canvas.height * 0.13 + imgOffset.y;
            const printW = canvas.width * 0.18 * imgScale;
            const printH = canvas.height * 0.74 * imgScale;
            const ratio = fg.width / fg.height;
            let drawW = printW, drawH = printH;
            if (drawW / drawH > ratio) {
              drawW = drawH * ratio;
            } else {
              drawH = drawW / ratio;
            }
            const drawX = printX + (printW - drawW) / 2;
            const drawY = printY + (printH - drawH) / 2;
            ctx.drawImage(fg, drawX, drawY, drawW, drawH);
            ctx.restore();
          } else {
            const fgW = fg.width * imgScale * 0.5;
            const fgH = fg.height * imgScale * 0.5;
            const fgX = (canvas.width - fgW) / 2 + imgOffset.x;
            const fgY = (canvas.height - fgH) / 2 + imgOffset.y;
            ctx.drawImage(fg, fgX, fgY, fgW, fgH);
          }
        };
      }
    };
  }, [uploadedImg, selected, imgScale, imgOffset]);

  useEffect(() => {
    // 굿즈 종류나 업로드 이미지가 바뀔 때마다 위치/크기 초기화
    
    // 진행 중인 이미지 로딩 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setImgOffset({ x: 0, y: 0 });
    setImgScale(1);
    setUploadedImg(null); // 굿즈 바꿀 때 업로드 이미지도 초기화
    
    // 캔버스 즉시 비우기 및 새로운 굿즈 배경 그리기
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      // 캔버스 완전히 비우기
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 새로운 굿즈 배경 즉시 그리기
      const bg = new window.Image();
      bg.crossOrigin = "anonymous";
      bg.src = selected.img;
      bg.onload = () => {
        // AbortController로 중단되었는지 확인
        if (abortControllerRef.current?.signal.aborted) return;
        
        const imgRatio = bg.width / bg.height;
        const canvasRatio = canvas.width / canvas.height;
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
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selected.key]);

  // 파일 첨부
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedImg(URL.createObjectURL(file));
  };

  // AI 캐릭터 선택
  const handleSelectAiImage = (url) => {
    setUploadedImg(url);
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

  // 결제창 띄우기 함수
  const handleOrder = () => {
    navigate("/order", { state: { product: {
      name: selected.label,
      desc: selected.description,
      option: `${quantity}개`,
      price: parseInt(selected.price.replace(/[^0-9]/g, '')),
      image: uploadedImg || aiImg || selected.img,
      quantity: quantity,
    } } });
  };

  // 장바구니 추가 함수
  const handleAddToCart = async () => {
    // TODO: 실제 로그인 유저ID로 대체 필요
    const userId = 1;
    const goodsId = selected.key; // 실제 goodsId로 대체 필요
    const quantityValue = quantity;
    try {
      const res = await fetch("http://localhost:8080/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 0,
          goodsId: 0,
          quantity: Number(quantity)
        })
      });
      const data = await res.json();
      if (data.cartId) {
        sessionStorage.setItem("cart_id", data.cartId);
        alert("장바구니에 추가되었습니다!");
      } else {
        alert("장바구니 추가 실패: " + (data.message || ""));
      }
    } catch (e) {
      alert("장바구니 추가 중 오류 발생");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
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
                  // onClick={handleOrder}
                  onClick={() => navigate('/order', {
                    state: {
                      quantity,
                      label: selected.label,
                      description: selected.description,
                      img: selected.img,
                      price: calculatePrice(),
                      minQuantity: selected.minQuantity,
                      features: selected.features
                    }
                  })}
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
                  key={selected.key} // 굿즈 변경 시 캔버스 완전히 새로 생성
                  width={800}
                  height={450}
                  className="rounded-xl"
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
              <h3 className="font-semibold mb-2">내 AI 캐릭터 선택</h3>
              {aiImages.length > 0 ? (
                <div className="flex gap-4">
                  {aiImages.map(img => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt="AI 캐릭터"
                      className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                        uploadedImg === img.imageUrl ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectAiImage(img.imageUrl)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 max-w-md">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">AI 캐릭터가 없어요!</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      나만의 특별한 AI 캐릭터를 만들어보세요
                    </p>
                  </div>
                  <Link
                    to="/character-maker"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    AI 캐릭터 만들기
                  </Link>
                </div>
              )}
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