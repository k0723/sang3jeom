package com.example.review.service;

import com.example.review.client.UserServiceClient;
import com.example.review.dto.ReviewRequestDTO;
import com.example.review.dto.ReviewResponseDTO;
import com.example.review.domain.Review;
import com.example.review.repository.ReviewRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserServiceClient userServiceClient;

    // 리뷰 생성
    public void createReview(Long userId, ReviewRequestDTO requestDTO) {
        try {
            userServiceClient.getUserById(userId);
        } catch (FeignException.NotFound e) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다. userId: " + userId);
        }

        Review review = Review.builder()
                .content(requestDTO.getContent())
                .rating(requestDTO.getRating())
                .userId(userId)
                .imageUrl(requestDTO.getImageUrl())
                .build();
        reviewRepository.save(review);
    }

    // 리뷰 수정
    public void updateReview(Long reviewId, Long userId, ReviewRequestDTO requestDTO) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰가 존재하지 않습니다. : " + reviewId));

        // 리뷰 작성자 본인인지 권한 확인
        if (!review.getUserId().equals(userId)) {
            try {
                throw new AccessDeniedException("리뷰를 수정할 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        review.update(requestDTO.getContent(), requestDTO.getRating(), requestDTO.getImageUrl());
    }

    // 리뷰 삭제
    public void deleteReview(Long currentUserId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰가 존재하지 않습니다. : " + reviewId));

        // 리뷰 작성자 본인인지 권한 확인
        if (!review.getUserId().equals(currentUserId)) {
            try {
                throw new AccessDeniedException("리뷰를 삭제할 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        reviewRepository.delete(review);
    }

    // 리뷰 조회
    @Transactional(readOnly = true)
    public ReviewResponseDTO findReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다. ID: " + reviewId));
        return new ReviewResponseDTO(review);
    }

    // 리뷰 전체 조회
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> findAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewResponseDTO::new)
                .collect(Collectors.toList());
    }
}