package com.example.review.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewRequestDTO {

    private String content;

    @NotNull
    @Min(0)
    @Max(5)
    private Double rating;

    private String imageUrl;
}
