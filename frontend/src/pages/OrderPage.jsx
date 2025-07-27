import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";
import Modal from "../components/Modal";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    label,
    description,
    img,
    price,
    minQuantity,
    features,
    quantity
  } = location.state || {};

  const totalPrice = price ? parseInt(price.toString().replace(/[^0-9]/g, "")) : 12900;
  const unitPrice = quantity ? Math.round(totalPrice / quantity) : totalPrice;
  const product = {
    name: label || "에이센트ASCENT",
    desc: description || "에이센트 대용량 디퓨저 500ml 실내방향제 집들이선물 그린에어리 인테리어",
    option: quantity ? ` ${quantity}개` : "수량: 1개",
    price: totalPrice,
    image: img || "/assets/dog-cat.png",
    quantity: quantity || 1,
    features: features || []
  };
  // user 객체를 state로 관리
  const [userInfo, setUserInfo] = useState({
    name: "이주형",
    phone: "010-1234-1234",
    address: "서울특별시 강서구 강서로",
  });

  // 배송지/메모 입력값 state
  const [address1, setAddress1] = useState(""); // 기본 주소
  const [address2, setAddress2] = useState(""); // 상세 주소
  const [memo, setMemo] = useState("");
  const [isCustomMemo, setIsCustomMemo] = useState(false);
  const memoOptions = [
    "문 앞에 놓아주세요",
    "경비실에 맡겨주세요",
    "배송 전 연락주세요",
    "파손 주의 부탁드려요",
    "직접 입력하기"
  ];

  const handleMemoChange = (e) => {
    const value = e.target.value;
    if (value === "직접 입력하기") {
      setIsCustomMemo(true);
      setMemo("");
    } else {
      setIsCustomMemo(false);
      setMemo(value);
    }
  };
  // 추가: 이메일, 수령인, 연락처 state (실제 서비스에서는 사용자 정보에서 받아야 함)
  const [email, setEmail] = useState("seul1234@gmail.com");
  const [receiver, setReceiver] = useState(userInfo.name);
  const [phone, setPhone] = useState(userInfo.phone);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "address" or "phone"
  const [tempAddress1, setTempAddress1] = useState("");
  const [tempAddress2, setTempAddress2] = useState("");
  const [tempPhone, setTempPhone] = useState("");

  // 모달 오픈 핸들러
  const openModal = (type) => {
    setModalType(type);
    if (type === "address") {
      setTempAddress1(address1);
      setTempAddress2(address2);
    } else if (type === "phone") {
      setTempPhone(phone);
    }
    setModalOpen(true);
  };

  // 모달 저장 핸들러
  const handleModalSave = () => {
    if (modalType === "address") {
      setUserInfo(prev => ({
        ...prev,
        address: tempAddress1
      }));
      setAddress1(tempAddress1);
      setAddress2(tempAddress2);
    } else if (modalType === "phone") {
      setUserInfo(prev => ({
        ...prev,
        phone: tempPhone
      }));
      setPhone(tempPhone);
    }
    setModalOpen(false);
  };

  // 서버 전송 시
  const handleOrder = () => {
    const fullAddress = `${address1} ${address2}`.trim();
    // 서버로 { address: fullAddress, phone } 등 전송
  };

  const calculatePrice = () => {
    return (product.price * (product.quantity || 1)).toLocaleString();
  };

  const calculateTotalPrice = () => {
    return (product.price * product.quantity).toLocaleString();
  };

  const handleKakaoPay = async () => {
    // 배송지/메모/이메일/수령인/연락처/금액 sessionStorage 저장
    sessionStorage.setItem("address", address1 || userInfo.address);
    sessionStorage.setItem("address2", address2); // 상세주소 저장
    sessionStorage.setItem("memo", memo);
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("receiver", receiver);
    sessionStorage.setItem("phone", phone);
    sessionStorage.setItem("amount", product.price.toString());
    sessionStorage.setItem("quantity", product.quantity.toString()); // 수량 저장
    
    // 상품 정보에 따른 goodsId와 goodsName 설정
    let goodsId = "1";
    let goodsName = "AI 캐릭터 상품";
    
    // 상품 이름에 따라 goodsId와 goodsName 설정
    if (product.name.toLowerCase().includes("머그컵") || product.name.toLowerCase().includes("mug")) {
      goodsId = "1";
      goodsName = "mug";
    } else if (product.name.toLowerCase().includes("티셔츠") || product.name.toLowerCase().includes("t-shirt")) {
      goodsId = "2";
      goodsName = "tshirt";
    } else if (product.name.toLowerCase().includes("에코백") || product.name.toLowerCase().includes("eco bag")) {
      goodsId = "3";
      goodsName = "echobag";
    } else if (product.name.toLowerCase().includes("케이스") || product.name.toLowerCase().includes("case")) {
      goodsId = "4";
      goodsName = "case";
    }
    
    // sessionStorage에 상품 정보 저장
    sessionStorage.setItem("goods_id", goodsId);
    sessionStorage.setItem("goods_name", goodsName);
    
    console.log("OrderPage - 상품 정보 저장:", {
      goodsId,
      goodsName,
      productName: product.name
    });
    const requestBody = {
      partnerOrderId: `ORDER_${Date.now()}`,
      partnerUserId: `USER_1`, // TODO: 실제 로그인 유저ID로 대체
      itemName: product.name,
      quantity: product.quantity || 1,
      totalAmount: product.price, // 총금액만 사용
      taxFreeAmount: 0
    };
    try {
      const res = await fetch("http://localhost:8082/pay/ready", {
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

  // 전화번호 자동 하이픈 함수
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length < 4) return numbers;
    if (numbers.length < 8) return numbers.slice(0, 3) + "-" + numbers.slice(3);
    return numbers.slice(0, 3) + "-" + numbers.slice(3, 7) + "-" + numbers.slice(7, 11);
  };

  // 전화번호 입력 onChange
  const handlePhoneChange = (e) => {
    setTempPhone(e.target.value.replace(/[^0-9]/g, ""));
  };

  // 하이픈에서 백스페이스 시, 앞자리 숫자도 같이 지움
  const handlePhoneKeyDown = (e) => {
    if (e.key === "Backspace") {
      const value = e.target.value;
      const cursor = e.target.selectionStart;
      if (cursor > 0 && value[cursor - 1] === "-") {
        e.preventDefault();
        // 하이픈 앞 숫자까지 지우기
        const raw = value.replace(/-/g, "");
        const newRaw = raw.slice(0, cursor - 2) + raw.slice(cursor - 1);
        setTempPhone(newRaw);
      }
    }
  };

  // 카카오 주소 검색 핸들러
  const handleSearchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 서비스를 불러올 수 없습니다.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function(data) {
        const newAddress = data.roadAddress || data.jibunAddress;
        setAddress1(newAddress);
        setUserInfo(prev => ({
          ...prev,
          address: newAddress
        }));
      }
    }).open();
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetch("http://localhost:8080/users/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        console.log("[OrderPage] /me API status:", res.status);
        return res.json();
      })
      .then(user => {
        console.log("[OrderPage] /me API user result:", user);
        setUserInfo(prev => ({
          ...prev,
          name: user.name || prev.name,
          phone: user.phone || prev.phone,
          address: user.address || prev.address
        }));
        if (user.email) setEmail(user.email); // 이메일도 업데이트
        setReceiver(user.name || "");
        setPhone(user.phone || "");
        setAddress1(user.address || "");
      })
      .catch((err) => {
        console.error("[OrderPage] /me API error:", err);
        // 에러시 기존 기본값 유지
      });
  }, []);

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
            <div className="mb-1 font-semibold">{userInfo.name}</div>
            <div className="flex items-center mb-1 text-gray-600">
              <span className="flex-1">{userInfo.phone}</span>
              <button
                className="ml-2 px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition"
                onClick={() => openModal("phone")}
              >
                휴대폰 번호 변경
              </button>
            </div>
            <div className="flex items-center mb-2 text-gray-700">
              <span className="flex-1">{userInfo.address}</span>
              <button
                className="ml-2 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition"
                onClick={handleSearchAddress}
              >
                주소 변경
              </button>
            </div>
            {/* 상세 주소 입력란만 남김 */}
            <div className="mb-2">
              <input
                className="w-full border rounded p-2"
                placeholder="상세 주소를 입력해주세요(동, 호수 등)"
                value={address2}
                onChange={e => setAddress2(e.target.value)}
              />
            </div>
            {/* 배송메모 드롭다운/직접입력 */}
            <div className="mb-2">
              {isCustomMemo ? (
                <input
                  className="w-full border rounded p-2"
                  placeholder="배송메모를 입력해주세요"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  onBlur={() => { if (!memo) setIsCustomMemo(false); }}
                />
              ) : (
                <select
                  className="w-full border rounded p-2"
                  value={memo}
                  onChange={handleMemoChange}
                >
                  <option value="" disabled>배송메모를 선택해주세요</option>
                  {memoOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
            {/* 추가: 이메일 입력 */}
            <input
              className="w-full border rounded p-2 mb-2"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
            />
          </div>

          {/* 주문상품 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-bold mb-2">주문상품</h2>
            <div className="flex items-center mb-2">
              <img src={product.image} alt="상품" className="w-16 h-16 rounded mr-4" />
              <div>
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-600">{product.desc}</div>
                <div className="text-xs text-gray-500">수량: {product.option}</div>
              </div>
            </div>
            {/* 가격/총금액 레이아웃 */}
            <div className="flex justify-between items-end mt-2">
              <div>
                <span className="text-base font-semibold text-gray-800">개당:{unitPrice.toLocaleString()}원</span>
              </div>
              <span className="text-lg font-bold text-green-600">{totalPrice.toLocaleString()}원</span>
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
              <span className="text-xl font-bold text-green-700">{totalPrice.toLocaleString()}원</span>
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

      {/* 모달 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6 min-w-[320px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {modalType === "address" ? "주소 변경" : "휴대폰 번호 변경"}
          </h2>
          {modalType === "address" ? null : (
            <input
              className="w-full border rounded p-2 mb-3"
              placeholder="휴대폰 번호"
              value={tempPhone}
              onChange={e => setTempPhone(formatPhoneNumber(e.target.value))}
              onKeyDown={handlePhoneKeyDown}
              maxLength={13}
            />
          )}
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              onClick={() => setModalOpen(false)}
            >
              취소
            </button>
            <button
              className={`px-4 py-2 rounded text-white font-semibold transition ${
                modalType === "address"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={handleModalSave}
              disabled={
                modalType === "address"
                  ? !tempAddress1.trim()
                  : !tempPhone.trim()
              }
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderPage; 