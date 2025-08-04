import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { createApiInstance } from '../utils/axiosInstance';

const orderServiceApi = createApiInstance('http://localhost:8082');

export default function PaySuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;

    const params = new URLSearchParams(location.search);
    const pg_token = params.get("pg_token");
    const tid = sessionStorage.getItem("kakao_tid");
    const partner_order_id = sessionStorage.getItem("partner_order_id");
    const partner_user_id = sessionStorage.getItem("partner_user_id");
    const cartId = sessionStorage.getItem("cart_id");
    const goodsId = sessionStorage.getItem("goods_id");
    const quantity = sessionStorage.getItem("quantity");
    const address = sessionStorage.getItem("address");
    const memo = sessionStorage.getItem("memo");
    const userId = sessionStorage.getItem("user_id");
    const receiver = sessionStorage.getItem("receiver") || "홍길동";
    const phone = sessionStorage.getItem("phone") || "010-1234-5678";
    const email = sessionStorage.getItem("email") || "seul1234@gmail.com";
    const amount = sessionStorage.getItem("amount");
    const price = sessionStorage.getItem("amount");
    const userName = sessionStorage.getItem("receiver") || "홍길동";

    const address1 = sessionStorage.getItem("address");
    const address2 = sessionStorage.getItem("address2") || "";
    const addressValue = (address1 ? address1 : "") + (address2 ? " " + address2 : "");
    const quantityValue = quantity ? Number(quantity) : 1;

    // sessionStorage에서 goodsName 가져오기
    const goodsName = sessionStorage.getItem("goods_name") || "AI 캐릭터 상품";
    
    // 디버깅을 위한 로그 추가
    console.log("PaySuccess - sessionStorage 값들:", {
      goodsId: sessionStorage.getItem("goods_id"),
      goodsName: sessionStorage.getItem("goods_name"),
      quantity: sessionStorage.getItem("quantity"),
      address: sessionStorage.getItem("address"),
      memo: sessionStorage.getItem("memo")
    });

    // goodsId가 null인 경우 기본값 설정
    const finalGoodsId = goodsId ? Number(goodsId) : 1;
    const finalGoodsName = goodsName || "AI 캐릭터 상품";

    console.log("PaySuccess - 최종 주문 데이터:", {
      goodsId: finalGoodsId,
      goodsName: finalGoodsName,
      quantity: quantityValue,
      address: addressValue,
      price: price ? Number(price) : 1
    });

    if (pg_token && tid && partner_order_id && partner_user_id) {
      api.post("/pay/approve", {
        tid,
        partner_order_id,
        partner_user_id,
        pg_token
      })
        .then(data => {
          const token = localStorage.getItem("accessToken");
          orderServiceApi.post("/orders/direct", {
            goodsId: finalGoodsId,
            goodsName: finalGoodsName,
            quantity: quantityValue,
            address: addressValue,
            memo: memo,
            price: price ? Number(price) : 1
          })
            .then(orderData => {
                // 세션스토리지에서 굿즈 정보 가져오기
                const savedGoodsId = sessionStorage.getItem("savedGoodsId");
                const savedGoodsImageUrl = sessionStorage.getItem("savedGoodsImageUrl");
                

                
                navigate("/order-complete", {
                  state: {
                    orderId: orderData.data.orderId || partner_order_id,
                    receiver,
                    phone,
                    address: addressValue, // 합쳐진 주소 전달
                    email,
                    amount: amount ? Number(amount) : 0,
                    savedGoodsId,
                    savedGoodsImageUrl
                  }
                });
            })
            .catch(() => {
                setStatus("error");
                setMessage("주문 생성 중 오류가 발생했습니다. 관리자에게 문의하세요.");
            });
        })
        .catch(() => {
            setStatus("error");
            setMessage("결제 승인 중 오류가 발생했습니다. 다시 시도해주세요.");
        });
    } else {
      setStatus("error");
      setMessage("결제 승인에 필요한 정보가 누락되었습니다.");
    }
  }, []); // 의존성 배열을 빈 배열로!

  // navigate가 실행되면 컴포넌트가 곧 언마운트되므로, 에러 메시지가 잠깐 보이는 현상 방지
  if (status === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          결제 승인 및 주문 생성 처리 중입니다...
        </div>
      </div>
    );
  }

  // 에러 상태만 메시지 노출
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-600 font-bold text-lg">{message}</div>
      </div>
    </div>
  );
} 