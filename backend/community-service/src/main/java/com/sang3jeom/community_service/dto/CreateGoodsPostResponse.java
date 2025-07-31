package com.sang3jeom.community_service.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CreateGoodsPostResponse {
    private Long id;
    private String content;
    private Long userId;
    private String userEmail;
    private String userName;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
} 