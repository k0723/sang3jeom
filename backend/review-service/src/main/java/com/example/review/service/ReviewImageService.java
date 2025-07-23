package com.example.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewImageService {

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private final S3Presigner s3Presigner;

    public String getPresignedUrl(String originalFilename) {
        // 파일 확장자 추출
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // S3에 저장될 새로운 파일 이름 생성 (중복 방지)
        String newFilename = "reviews/" + UUID.randomUUID() + extension;

        // S3에 객체를 업로드(PutObject)하기 위한 요청 생성
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(newFilename)
                .build();

        // Presigned URL 생성 요청
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(20))
                .putObjectRequest(objectRequest)
                .build();

        // Presigned URL 생성 및 반환
        return s3Presigner.presignPutObject(presignRequest).url().toString();
    }
}
