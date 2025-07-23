package com.example.review.controller;

import com.example.review.dto.ReviewRequestDTO;
import com.example.review.dto.ReviewResponseDTO;
import com.example.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 리뷰 생성
     * @param userId 게이트웨이에서 전달받은 사용자 ID
     * @param requestDTO 리뷰 내용, 별점, 이미지 URL
     * @return 생성 성공 시 200 OK
     */
    @PostMapping
    public ResponseEntity<Void> createReview(
            @RequestHeader("X-User-ID") Long userId,
            @RequestBody ReviewRequestDTO requestDTO) {
        reviewService.createReview(userId, requestDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 모든 리뷰 조회
     * @return 리뷰 목록
     */
    @GetMapping
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        List<ReviewResponseDTO> reviews = reviewService.findAllReviews();
        return ResponseEntity.ok(reviews);
    }

    /**
     * 특정 리뷰 단건 조회
     * @param reviewId 조회할 리뷰 ID
     * @return 특정 리뷰 정보
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> getReviewById(@PathVariable Long reviewId) {
        ReviewResponseDTO review = reviewService.findReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    /**
     * 리뷰 수정 (본인만 가능)
     * @param userId 게이트웨이에서 전달받은 사용자 ID
     * @param reviewId 수정할 리뷰 ID
     * @param requestDTO 수정할 리뷰 내용
     * @return 수정 성공 시 200 OK
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<Void> updateReview(
            @RequestHeader("X-User-ID") Long userId,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequestDTO requestDTO) {
        reviewService.updateReview(userId, reviewId, requestDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 리뷰 삭제 (본인만 가능)
     * @param userId 게이트웨이에서 전달받은 사용자 ID
     * @param reviewId 삭제할 리뷰 ID
     * @return 삭제 성공 시 200 OK
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @RequestHeader("X-User-ID") Long userId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.ok().build();
    }
}