import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/axiosInstance";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import PostUploadModal from "../components/PostUploadModal";

export default function OrderComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [aiImages, setAiImages] = useState([]);
  // location.state에서 필요한 정보 추출 (예시)
  const {
    orderId = "2020090519683953",
    receiver = "홍길동",
    phone = "010-1234-5678",
    address = "서울특별시 강남구 강남동 111-1번지 111호",
    email = "seul1234@gmail.com",
    amount = 64440,
    image = null,
    savedGoodsId,
    savedGoodsImageUrl
  } = location.state || {};



  useEffect(() => {
    if (!showModal) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    
    // 사용자 정보 가져오기
    api.get("/users/me")
      .then(res => res.data)
      .then(user => {
        setUser(user);
        
        // AI 이미지 가져오기
        return api.get(`/api/ai-images/user/${user.id}`);
      })
      .then(res => res.data)
      .then(images => {
        setAiImages(images);
      })
      .catch(() => {
        setUser(null);
        setAiImages([]);
      });
  }, [showModal]);

  // 게시글 업로드 후 커뮤니티로 이동
  const handlePost = async (post) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.post(
        "/goods-posts",
        {
          content: post.content,
          imageUrl: post.image || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", // 테스트용 이미지 URL
          status: "ALL"
        }
      );
      
      console.log("굿즈 게시물 생성 성공:", response.data);
      
      // 성공 시 커뮤니티로 이동
      navigate("/community", { state: { newPost: response.data } });
    } catch (error) {
      console.error("굿즈 게시물 생성 실패:", error);
      alert(error.response?.data?.message || "게시글 업로드에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-800">이전으로</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">주문완료</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>
      <div className="flex flex-col items-center py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mt-8">
          <div className="text-center mb-6">
            <div className="text-lg font-semibold mb-2">주문이 완료되었습니다.</div>
            <div className="text-sm text-gray-500">
              주문번호 : <span className="text-red-500 font-bold">{orderId}</span>
            </div>
          </div>
          <button
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg text-lg mb-2"
            onClick={() => navigate("/goods-maker")}
          >
            다른 굿즈 제작하기
          </button>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg mb-8"
            onClick={() => setShowModal(true)}
          >
            굿즈 자랑하기
          </button>
          <div className="border-t pt-4 mb-4">
            <div className="font-bold mb-2">배송정보</div>
            <div className="text-sm mb-1">
              <span className="font-semibold">{receiver}</span> / {phone}
            </div>
            <div className="text-sm text-gray-700">{address}</div>
          </div>
          <div className="border-t pt-4 mb-4">
            <div className="font-bold mb-2">결제정보 수신 이메일주소</div>
            <div className="text-sm text-gray-700">{email}</div>
          </div>
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">결제금액</span>
              <span className="text-2xl font-bold text-red-500">{amount.toLocaleString()}원</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">결제수단</span>
              <span className="font-semibold text-gray-800">카카오페이</span>
            </div>
          </div>
        </div>
      </div>
      {/* 모달: 유저 정보가 없으면 로딩, 있으면 모달 */}
      {showModal && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center text-lg font-bold">유저 정보를 불러오는 중...</div>
        </div>
      )}
      {showModal && user && (
        <PostUploadModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
          goodsImage={savedGoodsImageUrl || image} 
          aiImages={aiImages}
          savedGoodsId={savedGoodsId}
          onPost={handlePost} 
          user={user} 
        />
      )}
    </div>
  );
} 