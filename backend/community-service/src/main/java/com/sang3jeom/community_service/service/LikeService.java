package com.sang3jeom.community_service.service;

import com.sang3jeom.community_service.domain.Like;
import com.sang3jeom.community_service.dto.LikeDTO;
import com.sang3jeom.community_service.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;

    public LikeDTO toggleLike(Long goodsPostId, Long userId, String userEmail, String userName) {
        // 이미 좋아요를 눌렀는지 확인
        if (likeRepository.existsByGoodsPostIdAndUserId(goodsPostId, userId)) {
            // 좋아요 취소 (없으면 아무것도 안함)
            likeRepository.findByGoodsPostIdAndUserId(goodsPostId, userId)
                .ifPresent(likeRepository::delete);
            return null; // 좋아요 취소됨
        } else {
            // 좋아요 추가
            Like like = new Like();
            like.setGoodsPostId(goodsPostId);
            like.setUserId(userId);
            like.setUserEmail(userEmail);
            like.setUserName(userName);

            Like savedLike = likeRepository.save(like);
            return convertToDTO(savedLike);
        }
    }

    public List<LikeDTO> getLikesByPostId(Long postId) {
        return likeRepository.findByGoodsPostId(postId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean isLikedByUser(Long goodsPostId, Long userId) {
        return likeRepository.existsByGoodsPostIdAndUserId(goodsPostId, userId);
    }

    public long getLikeCount(Long goodsPostId) {
        return likeRepository.findByGoodsPostId(goodsPostId).size();
    }

    public void deleteLikesByPostId(Long postId) {
        likeRepository.deleteByGoodsPostId(postId);
    }

    private LikeDTO convertToDTO(Like like) {
        LikeDTO dto = new LikeDTO();
        dto.setId(like.getId());
        dto.setGoodsPostId(like.getGoodsPostId());
        dto.setUserId(like.getUserId());
        dto.setUserEmail(like.getUserEmail());
        dto.setUserName(like.getUserName());
        dto.setCreatedAt(like.getCreatedAt());
        return dto;
    }
} 