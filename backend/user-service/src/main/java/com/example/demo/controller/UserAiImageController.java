package com.example.demo.controller;

import com.example.demo.domain.UserAiImageEntity;
import com.example.demo.service.UserAiImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/ai-images")
@RequiredArgsConstructor
public class UserAiImageController {
    private final UserAiImageService aiImageService;

    // AI 이미지 저장 (멀티파트)
    @PostMapping
    public UserAiImageEntity saveImage(
            @RequestParam Long userId,
            @RequestParam MultipartFile file
    ) throws Exception {
        return aiImageService.saveAiImage(userId, file);
    }

    // 유저별 전체 이미지 조회
    @GetMapping("/user/{userId}")
    public List<UserAiImageEntity> getUserImages(@PathVariable Long userId) {
        return aiImageService.getUserImages(userId);
    }

    // 이미지 삭제
    @DeleteMapping("/{imageId}")
    public void deleteImage(@PathVariable Long imageId, @RequestParam Long userId) {
        aiImageService.deleteImage(imageId, userId);
    }
} 