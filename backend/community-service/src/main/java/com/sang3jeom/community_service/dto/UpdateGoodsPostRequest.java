package com.sang3jeom.community_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateGoodsPostRequest {
    private String content;
    private String imageUrl;
    private String status; // DRAFT, PUBLISHED, SOLD
} 