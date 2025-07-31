package com.example.review.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewImageService {

    @Value("${cloud.aws.s3.bucket}")  // application.yaml에서 읽어오기
    private String bucket;
    
    private final S3Presigner s3Presigner;

    public String getPresignedUrl(String originalFilename) {
        log.info("🖼️ S3 Presigned URL 생성 요청 | originalFilename: {}", originalFilename);
        
        // 파일 확장자 추출
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // S3에 저장될 새로운 파일 이름 생성 (폴더 구조 포함)
        String folderPath = "review-service-image/"; // 폴더 경로
        String fileName = UUID.randomUUID() + extension;
        String fullPath = folderPath + fileName;

        log.debug("📁 S3 파일 경로 생성 | bucket: {} | fullPath: {} | contentType: {}", 
                bucket, fullPath, getContentType(extension));

        // S3에 객체를 업로드(PutObject)하기 위한 요청 생성
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket) // 하드코딩된 버킷명 사용
                .key(fullPath) // 폴더 경로 포함
                .contentType(getContentType(extension)) // Content-Type 설정
                .build();

        // Presigned URL 생성 요청
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1)) // 1시간으로 단축
                .putObjectRequest(objectRequest)
                .build();

        // Presigned URL 생성 및 반환
        String presignedUrl = s3Presigner.presignPutObject(presignRequest).url().toString();
        
        log.info("✅ S3 Presigned URL 생성 성공 | fileName: {} | 유효시간: 1시간", fileName);
        log.debug("🔗 생성된 Presigned URL: {}", presignedUrl);
        
        return presignedUrl;
    }
    
    private String getContentType(String extension) {
        switch (extension.toLowerCase()) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".webp":
                return "image/webp";
            default:
                return "image/jpeg";
        }
    }
}
