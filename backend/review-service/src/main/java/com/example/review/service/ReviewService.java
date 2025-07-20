package com.example.review.service;

import com.example.review.dto.ReviewRequestDTO;
import com.example.review.dto.ReviewResponseDTO;
import com.example.review.domain.Review;
import com.example.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;

    // 리뷰 생성
    @Transactional
    public void createReview(Long userId, ReviewRequestDTO requestDTO) {
        Review review = Review.builder()
                .content(requestDTO.getContent())
                .rating(requestDTO.getRating())
                .userId(userId)
                .build();
        reviewRepository.save(review);
    }

    // 리뷰 조건부 조회 (QueryDSL)
    public List<ReviewResponseDTO> findReviews(Long userId, Double minRating) {
        return reviewRepository.findByConditions(userId, minRating).stream()
                .map(ReviewResponseDTO::new)
                .collect(Collectors.toList());
    }

    // 리뷰 수정
    @Transactional
    public void updateReview(Long id, ReviewRequestDTO requestDTO) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰가 없습니다. id=" + id));
        review.update(requestDTO.getContent(), requestDTO.getRating());
    }

    // 리뷰 삭제
    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}