package com.sang3jeom.community_service.service;

import com.sang3jeom.community_service.domain.GoodsPost;
import com.sang3jeom.community_service.dto.CreateGoodsPostRequest;
import com.sang3jeom.community_service.dto.CreateGoodsPostResponse;
import com.sang3jeom.community_service.dto.GoodsPostDTO;
import com.sang3jeom.community_service.repository.GoodsPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoodsPostService {

    private final GoodsPostRepository goodsPostRepository;
    private final CommentService commentService;
    private final LikeService likeService;

    public CreateGoodsPostResponse createGoodsPost(CreateGoodsPostRequest request, Long userId, String userEmail, String userName) {
        GoodsPost goodsPost = new GoodsPost();
        goodsPost.setContent(request.getContent());
        goodsPost.setImageUrl(request.getImageUrl());
        goodsPost.setStatus(request.getStatus() != null ? request.getStatus() : "ALL");
        goodsPost.setUserId(userId);
        goodsPost.setUserEmail(userEmail);
        goodsPost.setUserName(userName);

        GoodsPost savedPost = goodsPostRepository.save(goodsPost);

        return convertToCreateResponse(savedPost);
    }

    public GoodsPostDTO getGoodsPost(Long id) {
        GoodsPost goodsPost = goodsPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goods post not found with id: " + id));
        
        GoodsPostDTO dto = convertToDTO(goodsPost);
        
        // 댓글 수와 좋아요 수 추가
        dto.setCommentCount((long) commentService.getCommentsByPostId(id).size());
        dto.setLikeCount(likeService.getLikeCount(id));
        
        return dto;
    }

    public List<GoodsPostDTO> getAllGoodsPosts(Long userId) {
        return goodsPostRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(goodsPost ->
                    // 전체 공개(ALL)는 모두 볼 수 있고, PRIVATE는 본인만 볼 수 있음
                    !"PRIVATE".equals(goodsPost.getStatus()) || goodsPost.getUserId().equals(userId)
                )
                .map(goodsPost -> {
                    GoodsPostDTO dto = convertToDTO(goodsPost);
                    // 댓글 수와 좋아요 수 추가
                    dto.setCommentCount((long) commentService.getCommentsByPostId(goodsPost.getId()).size());
                    dto.setLikeCount(likeService.getLikeCount(goodsPost.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<GoodsPostDTO> getGoodsPostsByUserId(Long userId) {
        return goodsPostRepository.findByUserId(userId).stream()
                .map(goodsPost -> {
                    GoodsPostDTO dto = convertToDTO(goodsPost);
                    // 댓글 수와 좋아요 수 추가
                    dto.setCommentCount((long) commentService.getCommentsByPostId(goodsPost.getId()).size());
                    dto.setLikeCount(likeService.getLikeCount(goodsPost.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public GoodsPostDTO updateGoodsPost(Long id, String content, String imageUrl, String status) {
        GoodsPost goodsPost = goodsPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goods post not found with id: " + id));
        if (content != null) goodsPost.setContent(content);
        if (imageUrl != null) goodsPost.setImageUrl(imageUrl);
        if (status != null) goodsPost.setStatus(status);
        GoodsPost updatedPost = goodsPostRepository.save(goodsPost);
        
        GoodsPostDTO dto = convertToDTO(updatedPost);
        // 댓글 수와 좋아요 수 추가
        dto.setCommentCount((long) commentService.getCommentsByPostId(id).size());
        dto.setLikeCount(likeService.getLikeCount(id));
        
        return dto;
    }

    public void deleteGoodsPost(Long id) {
        if (!goodsPostRepository.existsById(id)) {
            throw new RuntimeException("Goods post not found with id: " + id);
        }
        goodsPostRepository.deleteById(id);
    }

    private CreateGoodsPostResponse convertToCreateResponse(GoodsPost goodsPost) {
        CreateGoodsPostResponse response = new CreateGoodsPostResponse();
        response.setId(goodsPost.getId());
        response.setContent(goodsPost.getContent());
        response.setUserId(goodsPost.getUserId());
        response.setUserEmail(goodsPost.getUserEmail());
        response.setUserName(goodsPost.getUserName());
        response.setImageUrl(goodsPost.getImageUrl());
        response.setStatus(goodsPost.getStatus());
        response.setCreatedAt(goodsPost.getCreatedAt());
        return response;
    }

    private GoodsPostDTO convertToDTO(GoodsPost goodsPost) {
        GoodsPostDTO dto = new GoodsPostDTO();
        dto.setId(goodsPost.getId());
        dto.setContent(goodsPost.getContent());
        dto.setUserId(goodsPost.getUserId());
        dto.setUserEmail(goodsPost.getUserEmail());
        dto.setUserName(goodsPost.getUserName());
        dto.setImageUrl(goodsPost.getImageUrl());
        dto.setStatus(goodsPost.getStatus());
        dto.setCreatedAt(goodsPost.getCreatedAt());
        dto.setUpdatedAt(goodsPost.getUpdatedAt());
        return dto;
    }
} 