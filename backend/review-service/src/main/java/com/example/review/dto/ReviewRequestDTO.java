package com.example.review.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ReviewRequestDTO {

    @NotNull(message = "주문 ID는 필수입니다.")
    private Long orderId; // 주문 ID 추가

    private String content;

    @NotNull(message = "별점은 필수입니다.")
    @Min(value = 0, message = "별점은 0점 이상이어야 합니다.")
    @Max(value = 5, message = "별점은 5점 이하여야 합니다.")
    private Double rating; // 0.5 ~ 5.0 (0.5 단위)

    private List<String> imageUrls; // 여러 이미지 지원
}