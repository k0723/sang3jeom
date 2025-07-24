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
        log.info("createReview Start!!");
        log.info("userId requestDTO = {} {}", userId,requestDTO);
        reviewService.createReview(userId, requestDTO);
        log.info("createReview End!!");
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
        log.info("getReviews Start!!");
        return ResponseEntity.ok(reviewService.findReviewsByPage(pageable));
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
        log.info("updateReview Start!!");
        log.info("userId reviewId requestDTO = {} {} {}", userId, reviewId, requestDTO);
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
        log.info("deleteReview Start!!");
        log.info("userId reviewId = {} {}", userId, reviewId);
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.ok().build();
    }
}