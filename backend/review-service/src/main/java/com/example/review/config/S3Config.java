package com.example.review.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Slf4j
@Configuration
public class S3Config {

    @Value("${AWS_ACCESS_KEY_ID}")
    private String accessKey;

    @Value("${AWS_SECRET_ACCESS_KEY}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public S3Client s3Client() {
        log.info("⚙️ S3 Client 초기화 시작");
        log.debug("🔐 AWS 설정 | AccessKey: {} | Region: {} | SecretKey: {}", 
                accessKey != null ? accessKey.substring(0, 4) + "..." : "❌null", 
                region,
                secretKey != null ? "✅설정됨" : "❌null");
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
                
        log.info("✅ S3 Client 초기화 완료");
        return s3Client;
    }

    @Bean
    public S3Presigner s3Presigner() {
        log.info("⚙️ S3 Presigner 초기화 시작");
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
                
        log.info("✅ S3 Presigner 초기화 완료");
        return presigner;
    }
}
