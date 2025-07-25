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

    // S3 업로드
    public String uploadFile(MultipartFile file, Long userId) throws IOException {
        String key = "user-" + userId + "/ai-images/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        amazonS3.putObject(new PutObjectRequest(bucket, key, file.getInputStream(), null)
                .withCannedAcl(CannedAccessControlList.PublicRead));
        return amazonS3.getUrl(bucket, key).toString();
    }

    // S3 삭제
    public void deleteFile(String fileUrl) {
        String key = fileUrl.substring(fileUrl.indexOf("user-")); // user-...부터 끝까지
        amazonS3.deleteObject(bucket, key);
    }
} 