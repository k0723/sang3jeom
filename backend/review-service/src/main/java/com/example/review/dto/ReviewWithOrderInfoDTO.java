package com.example.review.dto;

import com.example.review.domain.Review;
import com.example.review.dto.client.OrderInfoDTO;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Getter
public class ReviewWithOrderInfoDTO {
    private final Long id;
    private final String content;
    private final Double rating;
    private final Long userId;
    private final Long orderId;
    private final List<String> imageUrls;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    
    // 주문 정보
    private final OrderInfoDTO orderInfo;

    public ReviewWithOrderInfoDTO(Review review, OrderInfoDTO orderInfo) {
        this.id = review.getId();
        this.content = review.getContent();
        this.rating = review.getRating();
        this.userId = review.getUserId();
        this.orderId = review.getOrderId();
        this.imageUrls = review.getImageUrl() != null ? 
                Arrays.asList(review.getImageUrl().split(",")) : 
                List.of();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
        this.orderInfo = orderInfo;
    }
}
