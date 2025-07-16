package com.sang3jeom.order_service.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KakaoPayReadyRequest {
    private String partnerOrderId;
    private String partnerUserId;
    private String itemName;
    private int quantity;
    private int totalAmount;
    private int taxFreeAmount;
}