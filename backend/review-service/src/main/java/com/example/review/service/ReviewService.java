package com.example.review.service;

import com.example.review.client.UserServiceClient;
import com.example.review.dto.ReviewRequestDTO;
import com.example.review.dto.ReviewResponseDTO;
import com.example.review.dto.client.UserInfoDTO;
import com.example.review.domain.Review;
import com.example.review.repository.ReviewRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserServiceClient userServiceClient;
    
    @Value("${review-service.user-verification.enabled:false}")
    private boolean userVerificationEnabled;
    
    @Value("${review-service.user-verification.fallback-on-error:true}")
    private boolean fallbackOnError;

    // 리뷰 생성
    public void createReview(Long userId, ReviewRequestDTO requestDTO) {
        log.info("🚀 리뷰 생성 시작 | userId: {} | rating: {}⭐ | content: '{}'", 
                userId, requestDTO.getRating(), 
                requestDTO.getContent().length() > 20 ? 
                    requestDTO.getContent().substring(0, 20) + "..." : requestDTO.getContent());
        
        // 사용자 존재 여부 확인 (설정에 따라 선택적 실행)
        if (userVerificationEnabled) {
            verifyUserExists(userId);
        } else {
            log.info("🔧 사용자 검증 비활성화 - 개발 모드 | userId: {}", userId);
        }

        Review review = Review.builder()
                .content(requestDTO.getContent())
                .rating(requestDTO.getRating())
                .userId(userId)
                .imageUrl(requestDTO.getImageUrl())
                .build();
                
        log.debug("📝 Review 엔티티 생성 완료 | createdAt: {} | hasImage: {}", 
                review.getCreatedAt(), requestDTO.getImageUrl() != null);
        
        Review savedReview = reviewRepository.save(review);
        
        log.info("✅ 리뷰 저장 성공 | reviewId: {} | userId: {} | createdAt: {}", 
                savedReview.getId(), savedReview.getUserId(), savedReview.getCreatedAt());
    }
    
    /**
     * 사용자 존재 여부 확인
     */
    private void verifyUserExists(Long userId) {
        try {
            log.debug("👤 사용자 존재 여부 확인 시작 | userId: {}", userId);
            UserInfoDTO userInfo = userServiceClient.getUserById(userId);
            
            if (userInfo == null || userInfo.getId() == null) {
                log.error("❌ 존재하지 않는 사용자 | userId: {}", userId);
                throw new IllegalArgumentException("존재하지 않는 사용자입니다. userId: " + userId);
            }
            
            log.debug("✅ 사용자 검증 완료 | userId: {} | name: {}", userId, userInfo.getName());
            
        } catch (FeignException.NotFound e) {
            log.error("❌ 사용자 조회 실패 (404) | userId: {} | error: {}", userId, e.getMessage());
            throw new IllegalArgumentException("존재하지 않는 사용자입니다. userId: " + userId);
        } catch (Exception e) {
            log.error("⚠️ 사용자 서비스 통신 오류 | userId: {} | error: {}", userId, e.getMessage());
            
            if (fallbackOnError) {
                log.warn("🔧 Fallback 모드 - 사용자 검증 건너뛰고 계속 진행 | userId: {}", userId);
                return;
            }
            
            throw new RuntimeException("사용자 서비스와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
    
    /**
     * 운영환경 여부 확인
     */
    private boolean isProductionEnvironment() {
        // 실제로는 @Value("${spring.profiles.active}") 등으로 확인
        return false; // 개발/테스트 단계에서는 false
    }

    // 리뷰 수정
    public void updateReview(Long reviewId, Long userId, ReviewRequestDTO requestDTO) {
        log.info("🔄 리뷰 수정 시작 | reviewId: {} | userId: {} | newRating: {}⭐", 
                reviewId, userId, requestDTO.getRating());
                
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.error("❌ 리뷰 수정 실패 - 존재하지 않는 리뷰 | reviewId: {}", reviewId);
                    return new IllegalArgumentException("해당 리뷰가 존재하지 않습니다. : " + reviewId);
                });

        // 리뷰 작성자 본인인지 권한 확인
        if (!review.getUserId().equals(userId)) {
            log.warn("⚠️ 리뷰 수정 권한 없음 | reviewId: {} | 요청자: {} | 작성자: {}", 
                    reviewId, userId, review.getUserId());
            try {
                throw new AccessDeniedException("리뷰를 수정할 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        review.update(requestDTO.getContent(), requestDTO.getRating(), requestDTO.getImageUrl());
        log.info("✅ 리뷰 수정 완료 | reviewId: {} | userId: {}", reviewId, userId);
    }

    // 리뷰 삭제
    public void deleteReview(Long currentUserId, Long reviewId) {
        log.info("🗑️ 리뷰 삭제 시작 | reviewId: {} | userId: {}", reviewId, currentUserId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.error("❌ 리뷰 삭제 실패 - 존재하지 않는 리뷰 | reviewId: {}", reviewId);
                    return new IllegalArgumentException("해당 리뷰가 존재하지 않습니다. : " + reviewId);
                });

        // 리뷰 작성자 본인인지 권한 확인
        if (!review.getUserId().equals(currentUserId)) {
            log.warn("⚠️ 리뷰 삭제 권한 없음 | reviewId: {} | 요청자: {} | 작성자: {}", 
                    reviewId, currentUserId, review.getUserId());
            try {
                throw new AccessDeniedException("리뷰를 삭제할 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        reviewRepository.delete(review);
        log.info("✅ 리뷰 삭제 완료 | reviewId: {} | userId: {}", reviewId, currentUserId);
    }

//    // 리뷰 조회
//    @Transactional(readOnly = true)
//    public ReviewResponseDTO findReviewById(Long reviewId) {
//        Review review = reviewRepository.findById(reviewId)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다. ID: " + reviewId));
//        return new ReviewResponseDTO(review);
//    }

    // 리뷰 조회
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> findReviewsByPage(Pageable pageable) {
        log.debug("📋 리뷰 목록 조회 | page: {} | size: {} | sort: {}", 
                pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());
        
        Page<ReviewResponseDTO> reviews = reviewRepository.findAll(pageable).map(ReviewResponseDTO::new);
        
        log.info("📊 리뷰 목록 조회 완료 | 총 {}건 | 현재 페이지: {}/{}", 
                reviews.getTotalElements(), reviews.getNumber() + 1, reviews.getTotalPages());
        
        return reviews;
    }
}