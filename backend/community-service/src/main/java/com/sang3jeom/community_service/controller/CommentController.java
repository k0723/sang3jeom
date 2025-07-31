package com.sang3jeom.community_service.controller;

import com.sang3jeom.community_service.dto.CommentDTO;
import com.sang3jeom.community_service.dto.CreateCommentRequest;
import com.sang3jeom.community_service.service.CommentService;
import com.sang3jeom.community_service.config.UserServiceClient;
import com.sang3jeom.community_service.dto.UserInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserServiceClient userServiceClient;

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @RequestBody CreateCommentRequest request,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[CommentController] 댓글 작성 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("댓글 작성 유저 ID: " + userInfo.getUserId());
        System.out.println("댓글 작성 유저 이름: " + userInfo.getName());
        System.out.println("댓글 작성 유저 이메일: " + userInfo.getEmail());

        return ResponseEntity.ok(commentService.createComment(request, 
            userInfo.getUserId().longValue(), 
            userInfo.getEmail(), 
            userInfo.getName()));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long commentId, 
            @RequestBody CreateCommentRequest request,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[CommentController] 댓글 수정 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("댓글 수정 유저 ID: " + userInfo.getUserId());
        System.out.println("댓글 수정 유저 이름: " + userInfo.getName());
        
        CommentDTO updated = commentService.updateComment(commentId, request, 
            userInfo.getUserId().longValue(), 
            userInfo.getEmail(), 
            userInfo.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[CommentController] 댓글 삭제 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("댓글 삭제 유저 ID: " + userInfo.getUserId());
        System.out.println("댓글 삭제 유저 이름: " + userInfo.getName());
        
        commentService.deleteComment(commentId, userInfo.getUserId().longValue());
        return ResponseEntity.noContent().build();
    }
} 