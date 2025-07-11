package com.sang3jeom.order_service.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class KakaoPayApproveResponse {
    private String aid;     // 요청 고유 번호
    private String tid;     // 결제 고유 번호
    private String cid;     // 가맹점 코드
    private String partner_order_id;    // 가맹점 주문 번호
    private String partner_user_id;     // 가맹점 회원 ID
    private String payment_method_type;  // 결제 수단
    private Amount amount;  // 결제 금액 정보
    private String item_name;   // 상품명
    private int quantity;   // 상품수량
    private String created_at;  // 결제 요청시간
    private String approved_at; //  결제 승인시간

    @Getter
    @Setter
    @ToString
    public static class Amount {
        private int total;  //총 결제 금액
        private int tax_free;   // 비과세 금액
        private int vat;    // 부가세
        private int point;  // 사용한 포인트
        private int discount;   // 할인 금액
        private int green_deposit;  // 컵 보증금
    }
}