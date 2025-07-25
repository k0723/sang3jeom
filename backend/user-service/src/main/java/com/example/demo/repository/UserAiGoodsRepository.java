package com.example.demo.repository;

import com.example.demo.domain.UserAiGoodsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserAiGoodsRepository extends JpaRepository<UserAiGoodsEntity, Long> {
    List<UserAiGoodsEntity> findByUserId(Long userId);
} 