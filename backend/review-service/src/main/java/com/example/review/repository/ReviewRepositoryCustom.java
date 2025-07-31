package com.example.review.repository;

import com.example.review.domain.Review;

import java.util.List;

public interface ReviewRepositoryCustom {
    List<Review> findByConditions(Long userId, Double minRating);
}
