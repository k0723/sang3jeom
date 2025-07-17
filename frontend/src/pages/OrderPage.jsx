import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product || {
    name: "에이센트ASCENT",
    desc: "에이센트 대용량 디퓨저 500ml 실내방향제 집들이선물 그린에어리 인테리어",
    option: "단품 [3개 구매시 3+1+사은품] / 1딥체리",
    price: 12900,
    image: "/assets/dog-cat.png",
    quantity: 1,
  };
  const user = {
    name: "이주형(집)",
    phone: "010-1234-1234",
    address: "서울특별시 강서구 강서로",
  };

  // 배송지/메모 입력값 state
  const [address, setAddress] = useState(user.address);
  const [memo, setMemo] = useState("");
  // 추가: 이메일, 수령인, 연락처 state (실제 서비스에서는 사용자 정보에서 받아야 함)
  const [email, setEmail] = useState("seul1234@gmail.com");
  const [receiver, setReceiver] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);

  const calculatePrice = () => {
    return (product.price * (product.quantity || 1)).toLocaleString();
  };

  const handleKakaoPay = async () => {
    // 배송지/메모/이메일/수령인/연락처/금액 sessionStorage 저장
    sessionStorage.setItem("address", address);
    sessionStorage.setItem("memo", memo);
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("receiver", receiver);
    sessionStorage.setItem("phone", phone);
    sessionStorage.setItem("amount", (product.price * (product.quantity || 1)).toString());
    const requestBody = {
      partnerOrderId: `ORDER_${Date.now()}`,
      partnerUserId: `USER_1`, // TODO: 실제 로그인 유저ID로 대체
      itemName: product.name,
      quantity: product.quantity || 1,
      totalAmount: product.price * (product.quantity || 1),
      taxFreeAmount: 0
    };
    try {
      const res = await fetch("http://localhost:8080/pay/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const data = await res.json();
      if (data.next_redirect_pc_url) {
        sessionStorage.setItem("kakao_tid", data.tid);
        sessionStorage.setItem("partner_order_id", requestBody.partnerOrderId);
        sessionStorage.setItem("partner_user_id", requestBody.partnerUserId);
        window.location.href = data.next_redirect_pc_url;
      } else {
        alert("결제창 생성 실패: " + (data.message || ""));
      }
    } catch (e) {
      alert("결제 요청 중 오류 발생");
    }
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
              <h1 className="text-2xl font-bold text-gray-800">주문/결제</h1>
              <p className="text-sm text-gray-600">주문 내용을 확인하고 결제해 주세요</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 주문서 UI */}
        <div className="max-w-2xl mx-auto p-6 bg-gray-50">
          {/* 배송지 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-bold mb-2">배송지</h2>
            <div className="mb-1 font-semibold">{user.name}</div>
            <div className="mb-1 text-gray-600">{user.phone}</div>
            <div className="mb-2 text-gray-700">{user.address}</div>
            <input
              className="w-full border rounded p-2 mb-2"
              placeholder="배송지 주소를 입력해주세요"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <input
              className="w-full border rounded p-2 mb-2"
              placeholder="배송메모를 입력해주세요"
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
            {/* 추가: 이메일 입력 */}
            <input
              className="w-full border rounded p-2 mb-2"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
            />
            <label className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" /> 다음에도 사용할게요
            </label>
          </div>

          {/* 주문상품 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-bold mb-2">주문상품</h2>
            <div className="flex items-center mb-2">
              <img src={product.image} alt="상품" className="w-16 h-16 rounded mr-4" />
              <div>
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-600">{product.desc}</div>
                <div className="text-xs text-gray-500">옵션: {product.option}</div>
              </div>
            </div>
            {/* 가격/총금액 레이아웃 */}
            <div className="flex justify-between items-end mt-2">
              <div>
                <span className="text-base font-semibold text-gray-800">개당:{product.price.toLocaleString()}원</span>
              </div>
              <span className="text-lg font-bold text-green-600">{calculatePrice()}원</span>
            </div>
            {/* 제작/배송 기간 */}
            <div className="flex gap-6 mt-2 text-xs text-gray-500">
              <span>제작 기간: <span className="font-semibold text-gray-700">5-7일</span></span>
              <span>배송 기간: <span className="font-semibold text-gray-700">2-3일</span></span>
            </div>
          </div>

          {/* 총 주문금액 및 결제/취소 버튼 */}
          <div className="bg-green-100 rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">총 주문금액</span>
              <span className="text-xl font-bold text-green-700">{calculatePrice()}원</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleKakaoPay}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg text-lg shadow"
              >
                결제하기
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg text-lg shadow"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 