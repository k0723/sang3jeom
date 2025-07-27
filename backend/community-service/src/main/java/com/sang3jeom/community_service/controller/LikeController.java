package com.sang3jeom.community_service.controller;

import com.sang3jeom.community_service.dto.LikeDTO;
import com.sang3jeom.community_service.service.LikeService;
import com.sang3jeom.community_service.config.UserServiceClient;
import com.sang3jeom.community_service.dto.UserInfoDTO;
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
    private final UserServiceClient userServiceClient;

    @PostMapping("/{goodsPostId}")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long goodsPostId,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[LikeController] 좋아요 토글 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("좋아요 토글 유저 ID: " + userInfo.getUserId());
        System.out.println("좋아요 토글 유저 이름: " + userInfo.getName());
        System.out.println("좋아요 토글 유저 이메일: " + userInfo.getEmail());

        LikeDTO like = likeService.toggleLike(goodsPostId, 
            userInfo.getUserId().longValue(), 
            userInfo.getEmail(), 
            userInfo.getName());
        long likeCount = likeService.getLikeCount(goodsPostId);
        boolean isLiked = likeService.isLikedByUser(goodsPostId, userInfo.getUserId().longValue());

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
    public ResponseEntity<Map<String, Boolean>> checkIfLiked(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[LikeController] 좋아요 체크 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("좋아요 체크 유저 ID: " + userInfo.getUserId());
        System.out.println("좋아요 체크 유저 이름: " + userInfo.getName());
        
        boolean isLiked = likeService.isLikedByUser(postId, userInfo.getUserId().longValue());
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }
} 