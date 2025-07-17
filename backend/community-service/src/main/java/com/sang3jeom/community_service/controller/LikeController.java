package com.sang3jeom.community_service.controller;

import com.sang3jeom.community_service.dto.LikeDTO;
import com.sang3jeom.community_service.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{goodsPostId}")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long goodsPostId) {
        // TODO: 실제 인증 정보에서 userId, userEmail, userName을 가져와야 함
        // 현재는 테스트용 하드코딩 값 사용
        Long userId = 1L;
        String userEmail = "test@example.com";
        String userName = "테스트유저";

        LikeDTO like = likeService.toggleLike(goodsPostId, userId, userEmail, userName);
        long likeCount = likeService.getLikeCount(goodsPostId);
        boolean isLiked = likeService.isLikedByUser(goodsPostId, userId);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("liked", isLiked);
        result.put("likeCount", likeCount);
        if (like != null) result.put("like", like);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeDTO>> getLikesByPostId(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.getLikesByPostId(postId));
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Map<String, Long>> getLikeCount(@PathVariable Long postId) {
        long count = likeService.getLikeCount(postId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/post/{postId}/check")
    public ResponseEntity<Map<String, Boolean>> checkIfLiked(@PathVariable Long postId) {
        // TODO: 실제 인증 정보에서 userId를 가져와야 함
        Long userId = 1L;
        
        boolean isLiked = likeService.isLikedByUser(postId, userId);
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }
} 