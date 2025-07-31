package com.example.review.config;

import feign.Logger;
import feign.Request;
import feign.Retryer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Slf4j
@Configuration
public class FeignConfig {

    /**
     * Feign 로그 레벨 설정
     */
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL; // 개발환경에서는 FULL, 운영환경에서는 BASIC
    }

    /**
     * Feign 요청 옵션 설정
     */
    @Bean
    public Request.Options requestOptions() {
        return new Request.Options(
                10, TimeUnit.SECONDS, // 연결 타임아웃: 10초
                30, TimeUnit.SECONDS, // 읽기 타임아웃: 30초
                true // 리다이렉트 허용
        );
    }

    /**
     * Feign 재시도 설정
     */
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(
                1000, // 첫 번째 재시도 간격 (1초)
                3000, // 최대 재시도 간격 (3초)
                3     // 최대 재시도 횟수
        );
    }
}
