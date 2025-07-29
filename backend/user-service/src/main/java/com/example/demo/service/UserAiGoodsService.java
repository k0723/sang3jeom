package com.example.demo.service;

import com.example.demo.domain.UserAiGoodsEntity;
import com.example.demo.domain.UserEntity;
import com.example.demo.dto.UserAiGoodsDTO;
import com.example.demo.repository.UserAiGoodsRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserAiGoodsService {
    private final UserAiGoodsRepository aiGoodsRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    @Transactional
    public UserAiGoodsEntity saveAiGoods(Long userId, String goodsType, MultipartFile file) throws IOException {
        System.out.println("UserAiGoodsService.saveAiGoods 호출 - userId: " + userId + ", goodsType: " + goodsType);
        
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));
        
        System.out.println("유저 찾기 완료: " + user.getName());
        
        // S3에 굿즈 업로드
        String imageUrl = s3Service.uploadGoodsFile(file, userId, goodsType);
        System.out.println("S3 업로드 완료: " + imageUrl);
        
        UserAiGoodsEntity entity = UserAiGoodsEntity.builder()
                .user(user)
                .goodsType(goodsType)
                .imageUrl(imageUrl)
                .build();
        
        UserAiGoodsEntity savedEntity = aiGoodsRepository.save(entity);
        System.out.println("데이터베이스 저장 완료 - id: " + savedEntity.getId());
        
        return savedEntity;
    }

    public List<UserAiGoodsDTO> getUserGoods(Long userId) {
        System.out.println("UserAiGoodsService.getUserGoods 호출 - userId: " + userId);
        
        // 전체 굿즈 데이터 확인
        List<UserAiGoodsEntity> allGoods = aiGoodsRepository.findAll();
        System.out.println("전체 굿즈 개수: " + allGoods.size());
        for (UserAiGoodsEntity entity : allGoods) {
            System.out.println("전체 굿즈 - id: " + entity.getId() + ", userId: " + entity.getUser().getId() + ", type: " + entity.getGoodsType() + ", imageUrl: " + entity.getImageUrl());
        }
        
        List<UserAiGoodsEntity> goods = aiGoodsRepository.findByUserId(userId);
        System.out.println("해당 유저의 굿즈 개수: " + goods.size());
        
        List<UserAiGoodsDTO> goodsDTOs = goods.stream()
                .map(entity -> UserAiGoodsDTO.builder()
                        .id(entity.getId())
                        .goodsType(entity.getGoodsType())
                        .imageUrl(entity.getImageUrl())
                        .createdAt(entity.getCreatedAt())
                        .userId(entity.getUser().getId())
                        .userName(entity.getUser().getName())
                        .build())
                .collect(Collectors.toList());
        
        for (UserAiGoodsDTO goodsDTO : goodsDTOs) {
            System.out.println("굿즈 DTO - id: " + goodsDTO.getId() + ", type: " + goodsDTO.getGoodsType() + ", imageUrl: " + goodsDTO.getImageUrl());
        }
        
        return goodsDTOs;
    }

    @Transactional
    public void deleteGoods(Long goodsId, Long userId) {
        UserAiGoodsEntity entity = aiGoodsRepository.findById(goodsId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "굿즈를 찾을 수 없습니다."));
        if (!entity.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 굿즈만 삭제할 수 있습니다.");
        }
        // S3에서 파일 삭제
        s3Service.deleteFile(entity.getImageUrl());
        aiGoodsRepository.delete(entity);
    }
} 