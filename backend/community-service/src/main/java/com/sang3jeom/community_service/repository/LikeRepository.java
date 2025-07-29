package com.sang3jeom.community_service.repository;

import com.sang3jeom.community_service.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByGoodsPostId(Long goodsPostId);
    Optional<Like> findByGoodsPostIdAndUserId(Long goodsPostId, Long userId);
    boolean existsByGoodsPostIdAndUserId(Long goodsPostId, Long userId);
    void deleteByGoodsPostId(Long goodsPostId);
} 