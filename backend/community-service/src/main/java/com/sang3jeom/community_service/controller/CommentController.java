package com.sang3jeom.community_service.controller;

import com.sang3jeom.community_service.dto.CommentDTO;
import com.sang3jeom.community_service.dto.CreateCommentRequest;
import com.sang3jeom.community_service.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody CreateCommentRequest request) {
        // TODO: 실제 인증 정보에서 userId, userEmail, userName을 가져와야 함
        // 현재는 테스트용 하드코딩 값 사용
        Long userId = 1L;
        String userEmail = "test@example.com";
        String userName = "테스트유저";

        return ResponseEntity.ok(commentService.createComment(request, userId, userEmail, userName));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long commentId, @RequestBody CreateCommentRequest request) {
        // TODO: 실제 인증 정보에서 userId, userEmail, userName을 가져와야 함
        Long userId = 1L;
        String userEmail = "test@example.com";
        String userName = "테스트유저";
        CommentDTO updated = commentService.updateComment(commentId, request, userId, userEmail, userName);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        // TODO: 실제 인증 정보에서 userId를 가져와야 함
        Long userId = 1L;
        
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
} 