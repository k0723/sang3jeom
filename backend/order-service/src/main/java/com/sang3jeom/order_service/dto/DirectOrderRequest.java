package com.sang3jeom.order_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DirectOrderRequest {
    private Integer goodsId;
    private Integer quantity;
    private Integer userId;
    private String memo; // optional
} 