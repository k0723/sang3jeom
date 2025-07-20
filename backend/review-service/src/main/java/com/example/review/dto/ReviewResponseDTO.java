package com.example.review.dto;

import com.example.review.domain.Review;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReviewResponseDTO {
    private final Long id;
    private final String content;
    private final Double rating;
    private final Long userId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public ReviewResponseDTO(Review entity) {
        this.id = entity.getId();
        this.content = entity.getContent();
        this.rating = entity.getRating();
        this.userId = entity.getUserId();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
    }
}
