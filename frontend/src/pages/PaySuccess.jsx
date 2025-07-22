import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaySuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");
  const navigatedRef = useRef(false);

  useEffect(() => {
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

    if (pg_token && tid && partner_order_id && partner_user_id) {
      fetch("http://localhost:8082/pay/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tid,
          partner_order_id,
          partner_user_id,
          pg_token
        })
      })
        .then(res => res.json())
        .then(data => {
          fetch("http://localhost:8082/orders/direct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goodsId: Number(goodsId),
              quantity: Number(quantity),
              userId: Number(userId),
              address: address,
              memo: memo,
              price: price ? Number(price) : 1, // 가격 정보 추가
              userName: userName    // 주문자 이름 추가
            })
          })
            .then(res => res.json())
            .then(orderData => {
              if (!navigatedRef.current) {
                navigatedRef.current = true;
                navigate("/order-complete", {
                  state: {
                    orderId: orderData.orderId || partner_order_id,
                    receiver,
                    phone,
                    address,
                    email,
                    amount: amount ? Number(amount) : 0
                  }
                });
              }
            })
            .catch(() => {
              if (!navigatedRef.current) {
                setStatus("error");
                setMessage("주문 생성 중 오류가 발생했습니다. 관리자에게 문의하세요.");
              }
            });
        })
        .catch(() => {
          if (!navigatedRef.current) {
            setStatus("error");
            setMessage("결제 승인 중 오류가 발생했습니다. 다시 시도해주세요.");
          }
        });
    } else {
      setStatus("error");
      setMessage("결제 승인에 필요한 정보가 누락되었습니다.");
    }
  }, [location, navigate]);

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