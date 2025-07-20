package com.example.review.dto;

import com.example.review.domain.Review;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewRequestDTO {
    private String content;
    private Double rating;
}
