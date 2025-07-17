package com.sang3jeom.order_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartOrderRequest {
    private Integer cartId;
    private String memo; // optional
    private String address; // 배송지 주소
} 