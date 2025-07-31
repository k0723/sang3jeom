package com.example.review.repository;

import com.example.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long>, ReviewRepositoryCustom {
    
    // 특정 주문의 리뷰 존재 여부 확인
    boolean existsByOrderId(Long orderId);
    
    // 특정 주문의 리뷰 조회
    Optional<Review> findByOrderId(Long orderId);
    
    // 사용자별, 주문별 리뷰 존재 여부 확인 (중복 리뷰 방지)
    boolean existsByOrderIdAndUserId(Long orderId, Long userId);
    
    // 여러 주문의 리뷰를 한 번에 조회 (특정 사용자)
    List<Review> findByOrderIdInAndUserId(List<Long> orderIds, Long userId);
    
    // 사용자의 모든 리뷰 조회 (최신순)
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
