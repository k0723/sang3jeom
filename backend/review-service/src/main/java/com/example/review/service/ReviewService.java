package com.example.review.service;

import com.example.review.client.OrderServiceClient;
import com.example.review.client.UserServiceClient;
import com.example.review.dto.ReviewRequestDTO;
import com.example.review.dto.ReviewResponseDTO;
import com.example.review.dto.ReviewSummaryDTO;
import com.example.review.dto.ReviewWithOrderInfoDTO;
import com.example.review.dto.client.OrderInfoDTO;
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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserServiceClient userServiceClient;
    private final OrderServiceClient orderServiceClient;
    
    @Value("${review-service.user-verification.enabled:false}")
    private boolean userVerificationEnabled;
    
    @Value("${review-service.user-verification.fallback-on-error:true}")
    private boolean fallbackOnError;

    // 리뷰 생성
    public void createReview(Long userId, ReviewRequestDTO requestDTO) {
        log.info("🚀 리뷰 생성 시작 | userId: {} | orderId: {} | rating: {}⭐ | content: '{}'", 
                userId, requestDTO.getOrderId(), requestDTO.getRating(), 
                requestDTO.getContent().length() > 20 ? 
                    requestDTO.getContent().substring(0, 20) + "..." : requestDTO.getContent());
        
        // 이미 리뷰가 존재하는지 확인
        if (reviewRepository.existsByOrderIdAndUserId(requestDTO.getOrderId(), userId)) {
            log.error("❌ 리뷰 생성 실패 - 이미 존재하는 리뷰 | orderId: {} | userId: {}", 
                    requestDTO.getOrderId(), userId);
            throw new IllegalArgumentException("이미 해당 주문에 대한 리뷰가 존재합니다.");
        }
        
        // 사용자 존재 여부 확인 (설정에 따라 선택적 실행)
        if (userVerificationEnabled) {
            verifyUserExists(userId);
        } else {
            log.info("🔧 사용자 검증 비활성화 - 개발 모드 | userId: {}", userId);
        }

        // 여러 이미지 URL을 JSON 형태로 저장
        String imageUrl = null;
        if (requestDTO.getImageUrls() != null && !requestDTO.getImageUrls().isEmpty()) {
            imageUrl = String.join(",", requestDTO.getImageUrls()); // 간단히 콤마로 구분
        }

        Review review = Review.builder()
                .content(requestDTO.getContent())
                .rating(requestDTO.getRating())
                .userId(userId)
                .orderId(requestDTO.getOrderId())
                .imageUrl(imageUrl)
                .build();
                
        log.debug("📝 Review 엔티티 생성 완료 | orderId: {} | hasImage: {}", 
                requestDTO.getOrderId(), imageUrl != null);
        
        Review savedReview = reviewRepository.save(review);
        
        log.info("✅ 리뷰 저장 성공 | reviewId: {} | orderId: {} | userId: {} | createdAt: {}", 
                savedReview.getId(), savedReview.getOrderId(), savedReview.getUserId(), savedReview.getCreatedAt());
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

        // 여러 이미지 URL을 콤마로 구분해서 저장
        String imageUrl = null;
        if (requestDTO.getImageUrls() != null && !requestDTO.getImageUrls().isEmpty()) {
            imageUrl = String.join(",", requestDTO.getImageUrls());
        }

        review.update(requestDTO.getContent(), requestDTO.getRating(), imageUrl);
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

    // === 주문별 리뷰 관련 메서드들 ===
    
    /**
     * 특정 주문의 리뷰 존재 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean hasReviewForOrder(Long orderId) {
        boolean exists = reviewRepository.existsByOrderId(orderId);
        log.debug("🔍 주문 리뷰 존재 여부 확인 | orderId: {} | exists: {}", orderId, exists);
        return exists;
    }
    
    /**
     * 특정 주문의 리뷰 조회 (수정 모달용)
     */
    @Transactional(readOnly = true)
    public ReviewResponseDTO getReviewByOrderId(Long orderId) {
        Review review = reviewRepository.findByOrderId(orderId)
                .orElseThrow(() -> {
                    log.error("❌ 주문 리뷰 조회 실패 - 존재하지 않는 리뷰 | orderId: {}", orderId);
                    return new IllegalArgumentException("해당 주문에 대한 리뷰가 존재하지 않습니다. orderId: " + orderId);
                });
        
        log.debug("✅ 주문 리뷰 조회 성공 | orderId: {} | reviewId: {} | rating: {}⭐", 
                orderId, review.getId(), review.getRating());
        
        return new ReviewResponseDTO(review);
    }
    
    /**
     * 여러 주문의 리뷰 정보 batch 조회
     */
    @Transactional(readOnly = true)
    public java.util.Map<Long, ReviewSummaryDTO> getReviewsByOrderIds(List<Long> orderIds, Long userId) {
        log.info("🔍 Batch 리뷰 조회 시작 | orderIds: {} | userId: {}", orderIds.size(), userId);
        
        List<Review> reviews = reviewRepository.findByOrderIdInAndUserId(orderIds, userId);
        
        // 모든 주문 ID에 대해 초기화
        java.util.Map<Long, ReviewSummaryDTO> result = new java.util.HashMap<>();
        orderIds.forEach(orderId -> {
            result.put(orderId, ReviewSummaryDTO.empty(orderId));
        });
        
        // 실제 리뷰가 있는 주문들 업데이트
        reviews.forEach(review -> {
            result.put(review.getOrderId(), ReviewSummaryDTO.from(review));
        });
        
        log.info("✅ Batch 리뷰 조회 완료 | 총 {}개 주문 중 {}개에 리뷰 존재", 
                orderIds.size(), reviews.size());
        
        return result;
    }
    
    /**
     * 사용자의 모든 리뷰 조회 (마이페이지용)
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getMyReviews(Long userId) {
        log.info("📋 사용자 리뷰 목록 조회 | userId: {}", userId);
        
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<ReviewResponseDTO> result = reviews.stream()
                .map(ReviewResponseDTO::new)
                .collect(Collectors.toList());
        
        log.info("✅ 사용자 리뷰 조회 완료 | userId: {} | 리뷰 수: {}개", userId, result.size());
        
        return result;
    }

    /**
     * 주문 정보를 포함한 사용자의 모든 리뷰 조회 (마이페이지용)
     */
    @Transactional(readOnly = true)
    public List<ReviewWithOrderInfoDTO> getMyReviewsWithOrderInfo(Long userId) {
        log.info("📋 주문 정보 포함 사용자 리뷰 목록 조회 | userId: {}", userId);
        
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Long> orderIds = reviews.stream()
                .map(Review::getOrderId)
                .collect(Collectors.toList());
        
        // Order Service에서 주문 정보들을 batch로 조회
        List<OrderInfoDTO> orderInfos;
        try {
            orderInfos = orderServiceClient.getOrdersByIds(orderIds);
        } catch (Exception e) {
            log.error("⚠️ Order Service 통신 실패 - Fallback으로 빈 주문 정보 반환 | userId: {} | error: {}", 
                    userId, e.getMessage());
            orderInfos = Collections.emptyList();
        }
        
        // 주문 ID를 키로 하는 Map 생성
        java.util.Map<Long, OrderInfoDTO> orderInfoMap = orderInfos.stream()
                .collect(Collectors.toMap(OrderInfoDTO::getOrderId, orderInfo -> orderInfo));
        
        List<ReviewWithOrderInfoDTO> result = reviews.stream()
                .map(review -> {
                    OrderInfoDTO orderInfo = orderInfoMap.get(review.getOrderId());
                    return new ReviewWithOrderInfoDTO(review, orderInfo);
                })
                .collect(Collectors.toList());
        
        log.info("✅ 주문 정보 포함 사용자 리뷰 조회 완료 | userId: {} | 리뷰 수: {}개", userId, result.size());
        
        return result;
    }
}