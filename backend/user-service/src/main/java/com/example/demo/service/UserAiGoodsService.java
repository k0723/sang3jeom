package com.example.demo.service;

import com.example.demo.domain.UserAiGoodsEntity;
import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserAiGoodsRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAiGoodsService {
    private final UserAiGoodsRepository aiGoodsRepository;
    private final UserRepository userRepository;

    public UserAiGoodsEntity saveAiGoods(Long userId, String goodsType, MultipartFile file) throws Exception {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // TODO: S3 업로드 로직 구현 필요 (file -> imageUrl)
        String imageUrl = "https://s3.amazonaws.com/bucket/" + file.getOriginalFilename();
        UserAiGoodsEntity entity = UserAiGoodsEntity.builder()
                .user(user)
                .goodsType(goodsType)
                .imageUrl(imageUrl)
                .build();
        return aiGoodsRepository.save(entity);
    }

    public List<UserAiGoodsEntity> getUserGoods(Long userId) {
        return aiGoodsRepository.findByUserId(userId);
    }

    public void deleteGoods(Long goodsId, Long userId) {
        UserAiGoodsEntity entity = aiGoodsRepository.findById(goodsId)
                .orElseThrow(() -> new IllegalArgumentException("Goods not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        aiGoodsRepository.delete(entity);
    }
} 