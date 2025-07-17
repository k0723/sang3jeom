package com.sang3jeom.community_service.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class GoodsPostDTO {
    private Long id;
    private String content;
    private Long userId;
    private String userEmail;
    private String userName;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 댓글 수와 좋아요 수 추가
    private Long commentCount = 0L;
    private Long likeCount = 0L;
} 