package com.example.demo.service;

import com.example.demo.domain.UserAiImageEntity;
import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserAiImageRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAiImageService {
    private final UserAiImageRepository aiImageRepo;
    private final UserRepository userRepo;
    private final S3Service s3Service;

    // AI 이미지 저장 (최대 3장 제한)
    @Transactional
    public UserAiImageEntity saveAiImage(Long userId, MultipartFile file) throws IOException {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));
        if (aiImageRepo.countByUser(user) >= 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지는 최대 3장까지 저장할 수 있습니다.");
        }
        String imageUrl = s3Service.uploadFile(file, userId);
        UserAiImageEntity entity = UserAiImageEntity.builder()
                .user(user)
                .imageUrl(imageUrl)
                .build();
        return aiImageRepo.save(entity);
    }

    // 유저별 전체 이미지 조회
    public List<UserAiImageEntity> getUserImages(Long userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));
        return aiImageRepo.findByUser(user);
    }

    // 이미지 삭제
    @Transactional
    public void deleteImage(Long imageId, Long userId) {
        UserAiImageEntity image = aiImageRepo.findById(imageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다."));
        if (!image.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 이미지만 삭제할 수 있습니다.");
        }
        s3Service.deleteFile(image.getImageUrl());
        aiImageRepo.delete(image);
    }
} 