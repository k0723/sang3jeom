package com.example.review.dto;

import com.example.review.domain.Review;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Getter
public class ReviewResponseDTO {
    private final Long id;
    private final String content;
    private final Double rating;
    private final Long userId;
    private final Long orderId; // 주문 ID 추가
    private final List<String> imageUrls; // 여러 이미지 지원
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public ReviewResponseDTO(Review entity) {
        this.id = entity.getId();
        this.content = entity.getContent();
        this.rating = entity.getRating();
        this.userId = entity.getUserId();
        this.orderId = entity.getOrderId();
        this.imageUrls = entity.getImageUrl() != null ? 
                Arrays.asList(entity.getImageUrl().split(",")) : 
                List.of();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
    }
}
