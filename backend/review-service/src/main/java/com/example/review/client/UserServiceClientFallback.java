package com.example.review.client;

import com.example.review.dto.client.UserInfoDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    @Override
    public UserInfoDTO getUserById(Long userId) {
        log.warn("⚠️ User Service 호출 실패 - Fallback 실행 | userId: {}", userId);
        
        // 개발/테스트 환경에서는 Mock 데이터 반환
        if ("local".equals(activeProfile) || "dev".equals(activeProfile)) {
            log.info("🧪 개발환경 - Mock 사용자 데이터 반환 | userId: {}", userId);
            return UserInfoDTO.builder()
                    .id(userId)
                    .email("mock.user" + userId + "@example.com")
                    .name("Mock User " + userId)
                    .phone("010-0000-" + String.format("%04d", userId % 10000))
                    .profileImageUrl(null)
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        
        // 운영환경에서는 예외 발생
        throw new RuntimeException("User Service가 현재 이용 불가능합니다. 잠시 후 다시 시도해주세요.");
    }
}
