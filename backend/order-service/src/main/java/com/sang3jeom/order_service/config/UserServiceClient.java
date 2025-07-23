package com.sang3jeom.order_service.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import com.sang3jeom.order_service.dto.UserInfoDTO;

@FeignClient(name = "user-service", url = "http://localhost:8080")
public interface UserServiceClient {
    @GetMapping("/users/me")
    UserInfoDTO getUserInfo(@RequestHeader("Authorization") String token);
} 