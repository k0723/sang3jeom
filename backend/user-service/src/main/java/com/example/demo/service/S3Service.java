package com.example.demo.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {
    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // S3 업로드 (AI 이미지용)
    public String uploadFile(MultipartFile file, Long userId) throws IOException {
        String key = "user-" + userId + "/ai-images/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        amazonS3.putObject(new PutObjectRequest(bucket, key, file.getInputStream(), null)
                .withCannedAcl(CannedAccessControlList.PublicRead));
        return amazonS3.getUrl(bucket, key).toString();
    }

    // S3 업로드 (굿즈용)
    public String uploadGoodsFile(MultipartFile file, Long userId, String goodsType) throws IOException {
        String key = "user-" + userId + "/goods/" + goodsType + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        amazonS3.putObject(new PutObjectRequest(bucket, key, file.getInputStream(), null)
                .withCannedAcl(CannedAccessControlList.PublicRead));
        return amazonS3.getUrl(bucket, key).toString();
    }

    // S3 삭제
    public void deleteFile(String fileUrl) {
        try {
            System.out.println("삭제할 파일 URL: " + fileUrl);
            
            // URL에서 key 추출
            String key;
            if (fileUrl.contains("user-")) {
                // 올바른 S3 URL인 경우
                key = fileUrl.substring(fileUrl.indexOf("user-"));
            } else {
                // 잘못된 URL인 경우 (현재 저장된 데이터)
                System.out.println("잘못된 S3 URL이므로 S3 삭제를 건너뜁니다: " + fileUrl);
                return;
            }
            
            System.out.println("삭제할 S3 key: " + key);
            amazonS3.deleteObject(bucket, key);
            System.out.println("S3 파일 삭제 완료");
        } catch (Exception e) {
            System.err.println("S3 파일 삭제 실패: " + e.getMessage());
            // S3 삭제 실패해도 데이터베이스 삭제는 계속 진행
        }
    }
} 