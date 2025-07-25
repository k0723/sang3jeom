package com.example.demo.repository;

import com.example.demo.domain.UserAiImageEntity;
import com.example.demo.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAiImageRepository extends JpaRepository<UserAiImageEntity, Long> {
    List<UserAiImageEntity> findByUser(UserEntity user);
    int countByUser(UserEntity user);
} 