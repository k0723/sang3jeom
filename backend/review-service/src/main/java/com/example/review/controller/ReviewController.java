package com.example.review.controller;

import com.example.review.dto.ReviewRequestDTO;
import com.example.review.dto.ReviewResponseDTO;
import com.example.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@Slf4j
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
        log.info("📝 [POST] 리뷰 생성 요청 | userId: {} | rating: {}⭐", userId, requestDTO.getRating());
        
        reviewService.createReview(userId, requestDTO);
        
        log.info("🎉 [POST] 리뷰 생성 응답 성공 | userId: {}", userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 리뷰 조회
     * @return 리뷰 목록
     */
    @GetMapping
    public ResponseEntity<Page<ReviewResponseDTO>> getReviews(
            // page: 페이지 번호 (0부터 시작), size: 페이지 당 개수
            // sort: 정렬 기준 (createdAt), direction: 정렬 방향 (내림차순)
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("📋 [GET] 리뷰 목록 조회 요청 | page: {} | size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<ReviewResponseDTO> reviews = reviewService.findReviewsByPage(pageable);
        
        log.info("✅ [GET] 리뷰 목록 조회 응답 | 조회된 리뷰 수: {}", reviews.getNumberOfElements());
        return ResponseEntity.ok(reviews);
    }

//    /**
//     * 특정 리뷰 단건 조회
//     * @param reviewId 조회할 리뷰 ID
//     * @return 특정 리뷰 정보
//     */
//    @GetMapping("/{reviewId}")
//    public ResponseEntity<ReviewResponseDTO> getReviewById(@PathVariable Long reviewId) {
//        ReviewResponseDTO review = reviewService.findReviewById(reviewId);
//        return ResponseEntity.ok(review);
//    }

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
        log.info("🔄 [PUT] 리뷰 수정 요청 | reviewId: {} | userId: {} | newRating: {}⭐", 
                reviewId, userId, requestDTO.getRating());
        
        reviewService.updateReview(userId, reviewId, requestDTO);
        
        log.info("✅ [PUT] 리뷰 수정 응답 성공 | reviewId: {} | userId: {}", reviewId, userId);
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
        log.info("🗑️ [DELETE] 리뷰 삭제 요청 | reviewId: {} | userId: {}", reviewId, userId);
        
        reviewService.deleteReview(userId, reviewId);
        
        log.info("✅ [DELETE] 리뷰 삭제 응답 성공 | reviewId: {} | userId: {}", reviewId, userId);
        return ResponseEntity.ok().build();
    }
}