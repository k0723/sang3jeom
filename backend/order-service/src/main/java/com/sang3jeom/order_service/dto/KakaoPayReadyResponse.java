package com.sang3jeom.order_service.dto;

import lombok.Getter;

@Getter
public class KakaoPayReadyResponse {
    private String tid;
    private String next_redirect_pc_url;
    private String created_at;
}
