package com.sang3jeom.community_service.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class LikeDTO {
    private Long id;
    private Long goodsPostId;
    private Long userId;
    private String userEmail;
    private String userName;
    private LocalDateTime createdAt;
} 