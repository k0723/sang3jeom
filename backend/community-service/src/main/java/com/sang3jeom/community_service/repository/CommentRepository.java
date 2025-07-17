package com.sang3jeom.community_service.repository;

import com.sang3jeom.community_service.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByGoodsPostIdOrderByCreatedAtDesc(Long goodsPostId);
    List<Comment> findByUserId(Long userId);
    void deleteByGoodsPostId(Long goodsPostId);
} 