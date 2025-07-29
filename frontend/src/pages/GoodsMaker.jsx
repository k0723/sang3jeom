import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from '../components/Navbar';
import ReviewForm from '../components/ReviewForm.jsx';
import ReviewSection from '../components/ReviewSection';
import { getUserIdFromToken } from '../utils/jwtUtils';
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
      // JWT 토큰에서 userId 추출
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("JWT 토큰이 없습니다. AI 이미지를 불러올 수 없습니다.");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        console.log("유저 정보를 확인할 수 없습니다.");
        return;
      }

      console.log("AI 이미지 불러오기 시작, userId:", userId);
      
      try {
        const res = await fetch(`http://localhost:8080/api/ai-images/user/${userId}`, {
          headers: { 
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
          
        console.log("API 응답 상태:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("AI 이미지 데이터:", data);
          setAiImages(data);
          
          // 이미지 프리로딩
          data.forEach(img => {
            const preloadImg = new Image();
            preloadImg.crossOrigin = "anonymous";
            preloadImg.onload = () => console.log("이미지 프리로딩 완료:", img.imageUrl);
            preloadImg.onerror = () => console.error("이미지 프리로딩 실패:", img.imageUrl);
            preloadImg.src = img.imageUrl;
          });
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
  }, []);

  // 통합된 캔버스 렌더링 useEffect
  useEffect(() => {
    console.log("캔버스 렌더링 시작:", { uploadedImg, aiImg, selected: selected.key, imgLoaded });
    
    // 진행 중인 이미지 로딩 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("캔버스가 없습니다.");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("캔버스 컨텍스트를 가져올 수 없습니다.");
      return;
    }
    
    // 캔버스 즉시 비우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 이미지 로드
    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    
    bg.onload = () => {
      // AbortController로 중단되었는지 확인
      if (abortControllerRef.current?.signal.aborted) {
        console.log("배경 이미지 로딩이 중단되었습니다.");
        return;
      }
      
      console.log("배경 이미지 로드 완료");
      
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
      const imageToDraw = uploadedImg || aiImg;
      if (imageToDraw) {
        console.log("합성 이미지 로딩 시작:", imageToDraw);
        const fg = new window.Image();
        fg.crossOrigin = "anonymous";
        
        fg.onload = () => {
          // AbortController로 중단되었는지 확인
          if (abortControllerRef.current?.signal.aborted) {
            console.log("합성 이미지 로딩이 중단되었습니다.");
            return;
          }
          
          console.log("합성 이미지 로드 완료, 캔버스에 그리기 시작");
          
          // 기본 이미지 크기 (imgScale 적용)
          const baseWidth = 270 * imgScale;
          const baseHeight = 270 * imgScale;
          const aspect = fg.width / fg.height;
          let drawW = baseWidth, drawH = baseHeight;
          if (aspect > 1) {
            drawH = baseWidth / aspect;
          } else {
            drawW = baseHeight * aspect;
          }
          
          // 굿즈별 합성 효과
          if (selected.key === "mug") {
            const mugWidth = 140 * imgScale;
            const mugHeight = 140 * imgScale;
            let mugDrawW = mugWidth, mugDrawH = mugHeight;
            if (aspect > 1) {
              mugDrawH = mugWidth / aspect;
            } else {
              mugDrawW = mugHeight * aspect;
            }
            drawCylindricalImage(
              ctx, fg, 
              imgOffset.x + canvas.width / 2 - mugDrawW / 2, 
              imgOffset.y + canvas.height / 2 - mugDrawH / 2, 
              mugDrawW, mugDrawH
            );
          } else if (selected.key === "tshirt") {
            // T-shirt 합성
            const tshirtWidth = 260 * imgScale;
            const tshirtHeight = 260 * imgScale;
            let tshirtDrawW = tshirtWidth, tshirtDrawH = tshirtHeight;
            if (aspect > 1) {
              tshirtDrawH = tshirtWidth / aspect;
            } else {
              tshirtDrawW = tshirtHeight * aspect;
            }
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(fg, imgOffset.x + 100, imgOffset.y + 80, tshirtDrawW, tshirtDrawH);
            ctx.restore();
          } else if (selected.key === "ecobag") {
            // 에코백 합성
            const bagWidth = 390 * imgScale;
            const bagHeight = 390 * imgScale;
            let bagDrawW = bagWidth, bagDrawH = bagHeight;
            if (aspect > 1) {
              bagDrawH = bagWidth / aspect;
            } else {
              bagDrawW = bagHeight * aspect;
            }
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(fg, imgOffset.x + 50, imgOffset.y + 50, bagDrawW, bagDrawH);
            ctx.restore();
          } else if (selected.key === "case") {
            // 폰케이스 합성
            const caseWidth = 200 * imgScale;
            const caseHeight = 200 * imgScale;
            let caseDrawW = caseWidth, caseDrawH = caseHeight;
            if (aspect > 1) {
              caseDrawH = caseWidth / aspect;
            } else {
              caseDrawW = caseHeight * aspect;
            }
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(fg, imgOffset.x + 75, imgOffset.y + 100, caseDrawW, caseDrawH);
            ctx.restore();
          } else {
            // 기본 합성
            ctx.drawImage(fg, imgOffset.x, imgOffset.y, drawW, drawH);
          }
          
          console.log("합성 완료, 로딩 상태 해제");
          setImgLoaded(true);
          bgRef.current = bg;
          fgRef.current = fg;
        };
        
        fg.onerror = (error) => {
          console.error("합성 이미지 로딩 실패:", error);
          setImgLoaded(true);
        };
        
        fg.src = imageToDraw;
      } else {
        console.log("합성할 이미지가 없습니다.");
        setImgLoaded(true);
        bgRef.current = bg;
        fgRef.current = null;
      }
    };
    
    bg.onerror = (error) => {
      console.error("배경 이미지 로딩 실패:", error);
      setImgLoaded(true);
    };
    
    bg.src = selected.img;
  }, [uploadedImg, aiImg, selected, imgLoaded, imgScale]);

  // 이미지 이동 시 합성 이미지만 다시 그리기 (깜빡임 방지)
  useEffect(() => {
    if (!bgRef.current) return;
    
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // 배경 이미지 다시 그리기 (캐시된 이미지 사용)
      const bg = bgRef.current;
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
      
      // 합성 이미지 다시 그리기
      const imageToDraw = uploadedImg || aiImg;
      if (imageToDraw && fgRef.current) {
        const fg = fgRef.current;
        
        // 기본 이미지 크기 (imgScale 적용)
        const baseWidth = 270 * imgScale;
        const baseHeight = 270 * imgScale;
        const aspect = fg.width / fg.height;
        let drawW = baseWidth, drawH = baseHeight;
        if (aspect > 1) {
          drawH = baseWidth / aspect;
        } else {
          drawW = baseHeight * aspect;
        }
        
        // 굿즈별 합성 효과
        if (selected.key === "mug") {
          const mugWidth = 140 * imgScale;
          const mugHeight = 140 * imgScale;
          let mugDrawW = mugWidth, mugDrawH = mugHeight;
          if (aspect > 1) {
            mugDrawH = mugWidth / aspect;
          } else {
            mugDrawW = mugHeight * aspect;
          }
          drawCylindricalImage(
            ctx, fg, 
            imgOffset.x + canvas.width / 2 - mugDrawW / 2, 
            imgOffset.y + canvas.height / 2 - mugDrawH / 2, 
            mugDrawW, mugDrawH
          );
        } else if (selected.key === "tshirt") {
          // T-shirt 합성
          const tshirtWidth = 260 * imgScale;
          const tshirtHeight = 260 * imgScale;
          let tshirtDrawW = tshirtWidth, tshirtDrawH = tshirtHeight;
          if (aspect > 1) {
            tshirtDrawH = tshirtWidth / aspect;
          } else {
            tshirtDrawW = tshirtHeight * aspect;
          }
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(fg, imgOffset.x + 100, imgOffset.y + 80, tshirtDrawW, tshirtDrawH);
          ctx.restore();
        } else if (selected.key === "ecobag") {
          // 에코백 합성
          const bagWidth = 390 * imgScale;
          const bagHeight = 390 * imgScale;
          let bagDrawW = bagWidth, bagDrawH = bagHeight;
          if (aspect > 1) {
            bagDrawH = bagWidth / aspect;
          } else {
            bagDrawW = bagHeight * aspect;
          }
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(fg, imgOffset.x + 50, imgOffset.y + 50, bagDrawW, bagDrawH);
          ctx.restore();
        } else if (selected.key === "case") {
          // 폰케이스 합성
          const caseWidth = 200 * imgScale;
          const caseHeight = 200 * imgScale;
          let caseDrawW = caseWidth, caseDrawH = caseHeight;
          if (aspect > 1) {
            caseDrawH = caseWidth / aspect;
          } else {
            caseDrawW = caseHeight * aspect;
          }
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(fg, imgOffset.x + 75, imgOffset.y + 100, caseDrawW, caseDrawH);
          ctx.restore();
        } else {
          // 기본 합성
          ctx.drawImage(fg, imgOffset.x, imgOffset.y, drawW, drawH);
        }
      }
    };
    
    // requestAnimationFrame을 사용하여 부드러운 렌더링
    const animationId = requestAnimationFrame(updateCanvas);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [imgOffset, selected.key, uploadedImg, aiImg, imgScale]);

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
    console.log("AI 이미지 선택:", url);
    setUploadedImg(url);
    setAiImg(url); // aiImg도 함께 설정
    setImgLoaded(false); // 로딩 상태 초기화
    
    // 이미지가 이미 로드되어 있는지 확인
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      console.log("선택된 AI 이미지 로드 완료:", url);
      // 이미지가 완전히 로드된 후에 로딩 상태 해제
      setTimeout(() => {
        setImgLoaded(true);
      }, 50); // 약간의 지연으로 캔버스 렌더링이 완료되도록 함
    };
    
    img.onerror = () => {
      console.error("선택된 AI 이미지 로드 실패:", url);
      setImgLoaded(true); // 에러가 나도 로딩 상태는 해제
    };
    
    // 이미 완전히 로드된 이미지인 경우
    if (img.complete) {
      console.log("이미지가 이미 완전히 로드되어 있음:", url);
      setImgLoaded(true);
    } else {
      img.src = url;
    }
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragging(true);
    setDragStart({ x, y });
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    setImgOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x, y });
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
    // goodsId와 goodsName 매핑
    const getGoodsIdAndName = (goodsKey) => {
      switch (goodsKey) {
        case "mug": return { goodsId: 1, goodsName: "AI 캐릭터 머그컵" };
        case "tshirt": return { goodsId: 2, goodsName: "AI 캐릭터 티셔츠" };
        case "ecobag": return { goodsId: 3, goodsName: "AI 캐릭터 에코백" };
        case "case": return { goodsId: 4, goodsName: "AI 캐릭터 폰케이스" };
        default: return { goodsId: 1, goodsName: "AI 캐릭터 상품" };
      }
    };

    const { goodsId, goodsName } = getGoodsIdAndName(selected.key);
    
    // 디버깅을 위한 로그 추가
    console.log("GoodsMaker - 선택된 굿즈 정보:", {
      selectedKey: selected.key,
      goodsId: goodsId,
      goodsName: goodsName,
      quantity: quantity
    });
    
    // sessionStorage에 goodsId와 goodsName 저장
    sessionStorage.setItem("goods_id", goodsId.toString());
    sessionStorage.setItem("goods_name", goodsName);
    
    // 저장 확인을 위한 로그
    console.log("GoodsMaker - sessionStorage 저장 확인:", {
      savedGoodsId: sessionStorage.getItem("goods_id"),
      savedGoodsName: sessionStorage.getItem("goods_name")
    });

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
    // JWT 토큰에서 userId 추출
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    const userId = getUserIdFromToken();
    if (!userId) {
      alert("유저 정보를 확인할 수 없습니다.");
      return;
    }
    
    const goodsId = selected.key; // 실제 goodsId로 대체 필요
    const quantityValue = quantity;
    try {
      const res = await fetch("http://localhost:8080/cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId: userId,
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

  // 굿즈 저장 함수
  const handleSaveGoods = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // JWT 토큰에서 userId 추출
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    const userId = getUserIdFromToken();
    if (!userId) {
      alert("유저 정보를 확인할 수 없습니다.");
      return;
    }
    
    const goodsType = selected.key;
    setImgLoaded(true);

    // 캔버스 이미지를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('이미지 변환 실패');
        return;
      }
      const file = new File([blob], `${goodsType}_goods.png`, { type: blob.type });
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('goodsType', goodsType);
      formData.append('file', file);

      const res = await fetch('http://localhost:8080/api/user-goods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
      if (res.ok) {
        alert('굿즈가 저장되었습니다!');
      } else {
        const err = await res.json();
        alert('굿즈 저장 실패: ' + (err.message || '오류'));
      }
    }, 'image/png');
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
            <div className="flex flex-col items-center min-h-[420px] justify-center bg-gray-50 rounded-xl shadow mb-4 border relative">
              {/* 미리보기 영역 렌더링 부분 */}
              <>
                <div className="flex items-center gap-2 my-2">
                  <label className="text-sm font-medium text-gray-700">이미지 크기</label>
                  <input
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.01"
                    value={imgScale}
                    onChange={e => setImgScale(Number(e.target.value))}
                    className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm font-semibold text-blue-600 min-w-[3rem]">
                    {Math.round(imgScale * 100)}%
                  </span>
                </div>
                <canvas
                  ref={canvasRef}
                  key={selected.key} // 굿즈 변경 시 캔버스 완전히 새로 생성
                  width={800}
                  height={450}
                  className="rounded-xl cursor-move"
                  style={{
                    imageRendering: 'auto',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                {!imgLoaded && (uploadedImg || aiImg) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">이미지 로딩 중...</span>
                    </div>
                  </div>
                )}
                {!(uploadedImg || aiImg) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg py-20 pointer-events-none">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>AI 캐릭터를 선택해주세요</p>
                    </div>
                  </div>
                )}
              </>
            </div>
            {/* 굿즈 저장 안내 및 버튼 */}
            <div className="flex flex-col items-center my-8">
              <div className="mb-2 text-gray-600 text-sm">합성 결과를 저장하려면 아래 버튼을 눌러주세요</div>
              <button
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg shadow hover:bg-blue-700 transition-colors duration-300"
                onClick={handleSaveGoods}
                disabled={!imgLoaded}
              >
                굿즈 저장하기
              </button>
            </div>

            {/* AI Image Upload */}
            <div className="mb-6 flex flex-col items-center">
              <h3 className="font-semibold mb-2">내 AI 캐릭터 선택</h3>
              {aiImages.length > 0 ? (
                <div className="flex gap-4 flex-wrap justify-center">
                  {aiImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        alt="AI 캐릭터"
                        className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                          uploadedImg === img.imageUrl ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectAiImage(img.imageUrl)}
                        onLoad={() => console.log("AI 이미지 로드 완료:", img.imageUrl)}
                        onError={(e) => console.error("AI 이미지 로드 실패:", img.imageUrl, e)}
                      />
                      {uploadedImg === img.imageUrl && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
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
              
              {/* 선택된 이미지 정보 */}
              {uploadedImg && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    AI 캐릭터가 선택되었습니다
                  </div>
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
            <ReviewForm />

            <ReviewSection />

            {/*<motion.div */}
            {/*  className="bg-white rounded-2xl shadow-lg p-6"*/}
            {/*  data-aos="fade-up"*/}
            {/*>*/}
            {/*  <h2 className="text-xl font-bold text-gray-800 mb-6">고객 후기</h2>*/}
            {/*  */}
            {/*  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
            {/*    <div className="p-4 border border-gray-200 rounded-lg">*/}
            {/*      <div className="flex items-center mb-3">*/}
            {/*        <div className="flex text-yellow-400">*/}
            {/*          {[...Array(5)].map((_, i) => (*/}
            {/*            <Star key={i} className="w-4 h-4 fill-current" />*/}
            {/*          ))}*/}
            {/*        </div>*/}
            {/*        <span className="ml-2 text-sm text-gray-600">5.0</span>*/}
            {/*      </div>*/}
            {/*      <p className="text-gray-700 mb-3">*/}
            {/*        "퀄리티가 정말 좋아요! AI로 만든 캐릭터가 너무 귀엽게 나왔습니다."*/}
            {/*      </p>*/}
            {/*      <div className="text-sm text-gray-500">- 김**님 (티셔츠 제작)</div>*/}
            {/*    </div>*/}
            {/*    */}
            {/*    <div className="p-4 border border-gray-200 rounded-lg">*/}
            {/*      <div className="flex items-center mb-3">*/}
            {/*        <div className="flex text-yellow-400">*/}
            {/*          {[...Array(5)].map((_, i) => (*/}
            {/*            <Star key={i} className="w-4 h-4 fill-current" />*/}
            {/*          ))}*/}
            {/*        </div>*/}
            {/*        <span className="ml-2 text-sm text-gray-600">5.0</span>*/}
            {/*      </div>*/}
            {/*      <p className="text-gray-700 mb-3">*/}
            {/*        "빠른 제작과 배송에 만족합니다. 다음에도 이용할 예정이에요!"*/}
            {/*      </p>*/}
            {/*      <div className="text-sm text-gray-500">- 이**님 (머그컵 제작)</div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</motion.div>*/}
          </div>
        </div>
      </div>
    </div>
  );
} 