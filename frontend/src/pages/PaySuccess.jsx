import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaySuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pg_token = params.get("pg_token");
    const tid = sessionStorage.getItem("kakao_tid");
    const partner_order_id = sessionStorage.getItem("partner_order_id");
    const partner_user_id = sessionStorage.getItem("partner_user_id");
    const cartId = sessionStorage.getItem("cart_id"); // 주문 생성에 필요 (handleOrder에서 저장 필요)
    const goodsId = sessionStorage.getItem("goods_id");
    const quantity = sessionStorage.getItem("quantity");
    const userId = sessionStorage.getItem("user_id");

    if (pg_token && tid && partner_order_id && partner_user_id) {
      fetch("http://localhost:8080/pay/approve", {
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
          // 결제 승인 성공 후 즉시주문 생성
          fetch("http://localhost:8080/orders/direct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goodsId: Number(goodsId),
              quantity: Number(quantity),
              userId: Number(userId)
            })
          })
            .then(res => res.json())
            .then(orderData => {
              setStatus("success");
              setMessage("결제 및 주문이 성공적으로 완료되었습니다! 주문번호: " + orderData.orderId);
              // 필요시 주문완료 페이지로 이동: setTimeout(() => navigate("/mypage"), 2000);
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
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        {status === "processing" && <div>결제 승인 및 주문 생성 처리 중입니다...</div>}
        {status === "success" && <div className="text-green-600 font-bold text-lg">{message}</div>}
        {status === "error" && <div className="text-red-600 font-bold text-lg">{message}</div>}
      </div>
    </div>
  );
} 