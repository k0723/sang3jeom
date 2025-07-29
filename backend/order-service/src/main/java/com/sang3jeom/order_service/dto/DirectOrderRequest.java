package com.sang3jeom.order_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DirectOrderRequest {
    private Long goodsId;
    private String goodsName;
    private int quantity;
    private long price;
    private String memo; // optional
    private String address; // 배송지 주소
} 