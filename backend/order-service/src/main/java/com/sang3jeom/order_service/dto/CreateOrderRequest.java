package com.sang3jeom.order_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
    private Integer cartId;    // 장바구니 주문용 (optional)
    private Integer goodsId;   // 즉시구매용 (optional)
    private int quantity;  // 즉시구매용 (optional, Integer -> int로 변경)
    private String userName; // 주문자 이름
    private long price;      // 가격
    private Integer userId;    // 즉시구매용 (optional, 추후 토큰에서 추출)
    private String memo;       // optional
    private String address;    // 배송지 주소
}
