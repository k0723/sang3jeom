package com.sang3jeom.community_service.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateGoodsPostRequest {
    private String content;
    private String imageUrl;
    private String status;
} 