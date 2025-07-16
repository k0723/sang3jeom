package com.sang3jeom.order_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KakaoPayApproveRequest {
    private String tid;
    private String partner_order_id;
    private String partner_user_id;
    private String pg_token;
}