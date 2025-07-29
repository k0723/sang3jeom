package com.sang3jeom.community_service.repository;

import com.sang3jeom.community_service.domain.GoodsPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoodsPostRepository extends JpaRepository<GoodsPost, Long> {
    List<GoodsPost> findByUserId(Long userId);
    List<GoodsPost> findByStatus(String status);
    
    // 최신 글이 먼저 오도록 정렬
    List<GoodsPost> findAllByOrderByCreatedAtDesc();
} 