package com.example.review.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BatchReviewRequestDTO {
    private List<Long> orderIds;
}