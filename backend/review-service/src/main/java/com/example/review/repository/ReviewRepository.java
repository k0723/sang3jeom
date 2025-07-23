package com.example.review.repository;

import com.example.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long>, ReviewRepositoryCustom {
}
