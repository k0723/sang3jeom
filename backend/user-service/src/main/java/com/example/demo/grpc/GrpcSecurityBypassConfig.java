package com.example.demo.grpc;

import net.devh.boot.grpc.server.security.authentication.GrpcAuthenticationReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;

@Configuration
public class GrpcSecurityBypassConfig {

    @Bean
    public GrpcAuthenticationReader grpcAuthenticationReader() {
        // 요청이 들어와도 인증 안 함 → null 반환
        return (call, headers) -> (Authentication) null;
    }
}
