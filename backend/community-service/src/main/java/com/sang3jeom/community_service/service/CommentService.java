package com.sang3jeom.community_service.service;

import com.sang3jeom.community_service.domain.Comment;
import com.sang3jeom.community_service.dto.CommentDTO;
import com.sang3jeom.community_service.dto.CreateCommentRequest;
import com.sang3jeom.community_service.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentDTO createComment(CreateCommentRequest request, Long userId, String userEmail, String userName) {
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setGoodsPostId(request.getGoodsPostId());
        comment.setUserId(userId);
        comment.setUserEmail(userEmail);
        comment.setUserName(userName);

        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }

    public List<CommentDTO> getCommentsByPostId(Long postId) {
        return commentRepository.findByGoodsPostIdOrderByCreatedAtDesc(postId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
        
        // 댓글 작성자만 삭제 가능
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("댓글을 삭제할 권한이 없습니다.");
        }
        
        commentRepository.delete(comment);
    }

    public void deleteCommentsByPostId(Long postId) {
        commentRepository.deleteByGoodsPostId(postId);
    }

    public CommentDTO updateComment(Long commentId, CreateCommentRequest request, Long userId, String userEmail, String userName) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
        // 댓글 작성자만 수정 가능
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("댓글을 수정할 권한이 없습니다.");
        }
        comment.setContent(request.getContent());
        Comment updated = commentRepository.save(comment);
        return convertToDTO(updated);
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setGoodsPostId(comment.getGoodsPostId());
        dto.setUserId(comment.getUserId());
        dto.setUserEmail(comment.getUserEmail());
        dto.setUserName(comment.getUserName());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
} 