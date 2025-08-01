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
        log.info("🔧 User Service Fallback 실행 | userId: {} | reason: 다른 개발자 작업 중", userId);
        
        // 개발용 Mock 데이터 반환
        String[] mockNames = {
            "김민수", "이영희", "박철수", "최수진", "정다영", 
            "황준호", "임서연", "조민우", "한지은", "신동혁"
        };
        
        int nameIndex = (int) (userId % mockNames.length);
        String mockName = mockNames[nameIndex];
        
        log.debug("🎭 Fallback Mock 데이터 생성 | userId: {} | mockName: {}", userId, mockName);
        
        return UserInfoDTO.builder()
                .id(userId)
                .email("mock.user" + userId + "@example.com")
                .name(mockName)
                .phone("010-" + String.format("%04d", userId % 10000) + "-" + String.format("%04d", (userId * 7) % 10000))
                .profileImageUrl(null)
                .createdAt(LocalDateTime.now().minusDays(userId % 365)) // 다양한 가입일
                .build();
    }
}
