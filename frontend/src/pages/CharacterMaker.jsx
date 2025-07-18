// frontend/src/pages/CharacterMaker.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from '../components/Navbar';
import { 
  Upload, 
  Download, 
  Sparkles, 
  Palette, 
  Image, 
  Settings,
  ArrowLeft,
  CheckCircle,
  Star,
  Users,
  Award,
  Zap,
  Heart
} from "lucide-react";
import AOS from 'aos';
import 'aos/dist/aos.css';

// JWT에서 userId 추출 함수 추가
function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const jsonPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(
      jsonPayload
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    ));
  } catch (e) {
    console.error('Invalid JWT:', e);
    return null;
  }
}

export default function CharacterMaker({ onDone }) {
  const [image, setImage] = useState(null);
      const [preview, setPreview] = useState(null);
    const [style, setStyle] = useState("귀여움");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInput = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 예시 매핑
  const styleMap = {
    "디즈니풍": "Disney style",
    "픽사풍": "Pixar style",
    "지브리풍": "Ghibli style",
    "귀여움": "cute",
    "만화": "cartoon",
    "심플": "simple"
  };
  const bgMap = {
    "sky blue": "a sky blue background",
    "forest": "a forest background",
    "ocean": "an ocean background",
    "city": "a city background",
    "transparent": "a transparent background"
  };
  const propMap = {
    "wearing glasses": "wearing glasses",
    "wearing a yellow hat": "wearing a yellow hat",
    "holding a red ball": "holding a red ball",
    "": ""
  };

  const styleOptions = [
    { key: "Disney style", icon: "🐭", description: "디즈니풍" },
    { key: "Ghibli style", icon: "🌱", description: "지브리풍" },
    { key: "Pixar style", icon: "🦊", description: "픽사풍" },
    { key: "Watercolor", icon: "🎨", description: "수채화" },
    { key: "Cartoon", icon: "🐻", description: "카툰" },
  ];



  async function generateCharacter({ imageFile, style }) {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("style", style);

    // 영어 프롬프트 생성 (스타일만)
    const prompt = `Draw a cute pet as a ${style} character.`;
    formData.append("prompt", prompt);

    const res = await fetch("http://localhost:8000/generate-character", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("AI 변환 실패");
    return await res.json();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    try {
              const data = await generateCharacter({
          imageFile: image,
          style,
        });
      setResult(data);
    } catch (err) {
      setError(err.message || "AI 변환 실패");
    }
      setLoading(false);
  };

  const handleDownload = () => {
    if (result && result.result_url) {
      const link = document.createElement("a");
      link.href = result.result_url;
      link.download = "ai_character.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveImage = async () => {
    let jwt = sessionStorage.getItem("jwt");
    try {
      // 혹시 객체가 저장되어 있다면 파싱
      if (jwt && jwt.startsWith("{")) {
        jwt = JSON.parse(jwt).token;
      }
    } catch (e) {}
    const payload = parseJwt(jwt);
    const userId = payload && payload.id;
    if (!userId) {
      alert("유저 정보를 확인할 수 없습니다.");
      return;
    }
    if (!result || !result.result_url) {
      alert("저장할 이미지가 없습니다.");
      return;
    }
    const res = await fetch("/api/ai-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify({ userId, imageUrl: result.result_url })
    });
    if (res.ok) {
      alert("이미지 저장 성공!");
    } else {
      const err = await res.json();
      alert(err.message || "저장 실패");
    }
  };

  const handleGoToGoodsMaker = () => {
    if (result && result.result_url) {
      navigate(`/goods-maker?img=${encodeURIComponent(result.result_url)}`);
      if (onDone) onDone();
    }
  };

  const stats = [
    { number: "50,000+", label: "생성 완료", icon: Sparkles },
    { number: "4.9", label: "고객 만족도", icon: Star },
    { number: "10,000+", label: "활성 사용자", icon: Users },
    { number: "3초", label: "평균 생성 시간", icon: Zap }
  ];

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
              <h1 className="text-2xl font-bold text-gray-800">상상상점 AI 캐릭터 생성</h1>
              <p className="text-sm text-gray-600">반려동물을 AI로 귀여운 캐릭터로 변신시켜보세요</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Options */}
          <div className="space-y-8">
            {/* Stats Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-right"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">서비스 현황</h2>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upload Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">이미지 업로드</h2>
              <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer ${
                  preview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => fileInput.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {preview ? (
                  <div className="text-center">
                    <img src={preview} alt="업로드 미리보기" className="w-32 h-32 object-cover rounded-lg shadow mb-4 mx-auto" />
                    <p className="text-green-600 font-semibold">이미지가 업로드되었습니다!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">여기에 이미지를 드래그하거나 클릭해서 업로드</p>
                    <p className="text-sm text-gray-500">JPG, PNG 파일 지원</p>
                  </div>
                )}
        <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInput}
          required
        />
              </div>
            </motion.div>

            {/* Style Options */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">스타일 선택</h2>
              <div className="grid grid-cols-1 gap-4">
                {styleOptions.map((option) => (
                  <motion.button
                    key={option.key}
                    type="button"
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      style === option.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setStyle(option.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{option.description}</div>
                        <div className="text-sm text-gray-600">{option.key}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            

            {/* Generate Button */}
            <motion.div 
              data-aos="fade-right"
              data-aos-delay="500"
            >
        <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                disabled={loading || !preview}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    AI 캐릭터 생성하기
                  </>
                )}
        </button>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center font-semibold">{error}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Result and Actions */}
          <div className="space-y-8">
            {/* Result Preview */}
      {result && (
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-6"
                data-aos="fade-left"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">생성 결과</h2>
                <div className="text-center">
                  <img 
                    src={result.result_url} 
                    alt="AI 캐릭터" 
                    className="mx-auto rounded-xl shadow-lg mb-6 w-64 h-64 object-cover"
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">선택된 옵션</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">스타일:</span>
                        <div className="font-semibold">{styleMap[style]}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5 inline mr-2" />
                      다운로드
                    </motion.button>
                    <motion.button
                      onClick={handleSaveImage}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart className="w-5 h-5 inline mr-2" />
                      이미지 저장
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Features */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">서비스 특징</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">AI 기반 변환</h3>
                    <p className="text-sm text-gray-600">최신 AI 기술로 반려동물을 귀여운 캐릭터로 변환</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Palette className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">다양한 스타일</h3>
                    <p className="text-sm text-gray-600">귀여움, 만화, 심플 등 다양한 스타일 선택 가능</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Image className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">고품질 출력</h3>
                    <p className="text-sm text-gray-600">고해상도 이미지로 굿즈 제작에 최적화</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">고객 후기</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    "우리 강아지가 너무 귀엽게 나왔어요! 굿즈로도 만들어서 정말 만족합니다."
                  </p>
                  <div className="text-xs text-gray-500">- 박**님</div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    "빠른 생성 속도와 퀄리티에 놀랐어요. 친구들한테도 추천했어요!"
                  </p>
                  <div className="text-xs text-gray-500">- 김**님</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}