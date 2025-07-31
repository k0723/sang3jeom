package com.example.review.controller;

import com.example.review.dto.*;
import com.example.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true"
)
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 리뷰 생성
     * @param userId 게이트웨이에서 전달받은 사용자 ID
     * @param requestDTO 리뷰 내용, 별점, 이미지 URL, 주문 ID
     * @return 생성 성공 시 200 OK
     */
    @PostMapping
    public ResponseEntity<Void> createReview(
            @RequestHeader("X-User-ID") Long userId,
            @RequestBody ReviewRequestDTO requestDTO) {
        log.info("📝 [POST] 리뷰 생성 요청 | userId: {} | orderId: {} | rating: {}⭐", 
                userId, requestDTO.getOrderId(), requestDTO.getRating());
        
        reviewService.createReview(userId, requestDTO);
        
        log.info("🎉 [POST] 리뷰 생성 응답 성공 | userId: {} | orderId: {}", 
                userId, requestDTO.getOrderId());
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
        
        reviewService.updateReview(reviewId, userId, requestDTO);
        
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

    // === 주문별 리뷰 관련 API ===

    /**
     * 특정 주문의 리뷰 존재 여부 확인
     */
    @GetMapping("/order/{orderId}/exists")
    public ResponseEntity<Boolean> hasReviewForOrder(@PathVariable Long orderId) {
        log.info("🔍 [GET] 주문 리뷰 존재 여부 확인 | orderId: {}", orderId);
        
        boolean exists = reviewService.hasReviewForOrder(orderId);
        
        log.info("✅ [GET] 주문 리뷰 존재 여부 응답 | orderId: {} | exists: {}", orderId, exists);
        return ResponseEntity.ok(exists);
    }

    /**
     * 특정 주문의 리뷰 조회 (수정 모달용)
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ReviewResponseDTO> getReviewByOrderId(@PathVariable Long orderId) {
        log.info("📄 [GET] 주문별 리뷰 조회 | orderId: {}", orderId);
        
        ReviewResponseDTO review = reviewService.getReviewByOrderId(orderId);
        
        log.info("✅ [GET] 주문별 리뷰 조회 응답 | orderId: {} | reviewId: {}", 
                orderId, review.getId());
        return ResponseEntity.ok(review);
    }

    /**
     * 여러 주문의 리뷰 정보 batch 조회
     */
    @PostMapping("/orders/batch")
    public ResponseEntity<Map<Long, ReviewSummaryDTO>> getReviewsByOrderIds(
            @RequestHeader("X-User-ID") Long userId,
            @RequestBody BatchReviewRequestDTO request) {
        log.info("🔍 [POST] Batch 리뷰 조회 | userId: {} | orderIds: {}", 
                userId, request.getOrderIds().size());
        
        Map<Long, ReviewSummaryDTO> reviews = reviewService.getReviewsByOrderIds(
                request.getOrderIds(), userId);
        
        log.info("✅ [POST] Batch 리뷰 조회 응답 | userId: {} | 총 {}개 주문", 
                userId, reviews.size());
        return ResponseEntity.ok(reviews);
    }

    /**
     * 사용자의 모든 리뷰 조회 (마이페이지용)
     */
    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getMyReviews(
            @RequestHeader("X-User-ID") Long userId) {
        log.info("📋 [GET] 내 리뷰 목록 조회 | userId: {}", userId);
        
        List<ReviewResponseDTO> reviews = reviewService.getMyReviews(userId);
        
        log.info("✅ [GET] 내 리뷰 목록 조회 응답 | userId: {} | 리뷰 수: {}개", 
                userId, reviews.size());
        return ResponseEntity.ok(reviews);
    }

    /**
     * 주문 정보를 포함한 사용자의 모든 리뷰 조회 (마이페이지용)
     */
    @GetMapping("/my-reviews-with-order-info")
    public ResponseEntity<List<ReviewWithOrderInfoDTO>> getMyReviewsWithOrderInfo(
            @RequestHeader("X-User-ID") Long userId) {
        log.info("📋 [GET] 주문 정보 포함 내 리뷰 목록 조회 | userId: {}", userId);
        
        List<ReviewWithOrderInfoDTO> reviews = reviewService.getMyReviewsWithOrderInfo(userId);
        
        log.info("✅ [GET] 주문 정보 포함 내 리뷰 목록 조회 응답 | userId: {} | 리뷰 수: {}개", 
                userId, reviews.size());
        return ResponseEntity.ok(reviews);
    }
}