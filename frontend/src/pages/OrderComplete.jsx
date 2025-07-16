import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import PostUploadModal from "../components/PostUploadModal";

export default function OrderComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  // location.state에서 필요한 정보 추출 (예시)
  const {
    orderId = "2020090519683953",
    receiver = "홍길동",
    phone = "010-1234-5678",
    address = "서울특별시 강남구 강남동 111-1번지 111호",
    email = "seul1234@gmail.com",
    amount = 64440,
    image = null
  } = location.state || {};

  // 게시글 업로드 후 커뮤니티로 이동
  const handlePost = (post) => {
    // TODO: 실제 업로드 API 연동
    navigate("/community", { state: { newPost: post } });
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
      <PostUploadModal open={showModal} onClose={() => setShowModal(false)} image={image} onPost={handlePost} />
    </div>
  );
} 