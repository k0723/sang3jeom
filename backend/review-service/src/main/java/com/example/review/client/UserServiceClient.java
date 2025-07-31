package com.example.review.client;

import com.example.review.dto.client.UserInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// User Service 직접 호출 (8080 포트)
@FeignClient(
    name = "user-service", 
    url = "${service-urls.user-service}",
    fallback = UserServiceClientFallback.class
)
public interface UserServiceClient {

    /**
     * User Service의 실제 API: GET /users/{id}
     * User Service가 쿠키 기반 인증을 사용하지만, 서비스 간 통신에서는 별도 처리 필요
     * @param userId 조회할 사용자의 ID
     * @return 사용자 정보 DTO
     */
    @GetMapping("/users/{id}")
    UserInfoDTO getUserById(@PathVariable("id") Long userId);
}