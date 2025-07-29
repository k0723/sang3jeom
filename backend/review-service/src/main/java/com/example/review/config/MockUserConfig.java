package com.example.review.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * 개발/테스트 환경에서 User Service Mock을 활성화하는 설정
 * application.yaml에서 mock.user-service.enabled=true로 설정 시 활성화
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "mock.user-service.enabled", havingValue = "true", matchIfMissing = false)
public class MockUserConfig {
    
    public MockUserConfig() {
        log.info("🧪 Mock User Service 활성화됨 - 개발/테스트 모드");
    }
}
