package com.example.review.dto;

import com.example.review.domain.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryDTO {
    private Long reviewId;
    private Long orderId;
    private boolean exists;
    private Double rating;
    private LocalDateTime createdAt;
    
    public static ReviewSummaryDTO empty(Long orderId) {
        return new ReviewSummaryDTO(null, orderId, false, null, null);
    }
    
    public static ReviewSummaryDTO from(Review review) {
        return new ReviewSummaryDTO(
                review.getId(),
                review.getOrderId(),
                true,
                review.getRating(),
                review.getCreatedAt()
        );
    }
}