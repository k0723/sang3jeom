package com.example.review.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewDTO {

    private Long reviewId;

    private int rating;

    private String content;

    private LocalDateTime createdAt;
}
