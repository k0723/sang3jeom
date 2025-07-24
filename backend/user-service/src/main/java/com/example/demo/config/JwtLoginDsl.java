package com.example.demo.config;

import com.example.demo.config.JwtConfig; // JwtConfig 변경사항 반영
import com.example.demo.util.JwtLoginFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

public class JwtLoginDsl extends AbstractHttpConfigurer<JwtLoginDsl, HttpSecurity> {
    private final JwtConfig jwtConfig;

    private JwtLoginDsl(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        // ① AuthenticationManager를 HttpSecurity에서 안전하게 가져오기
        AuthenticationManager authManager = http.getSharedObject(AuthenticationManager.class);

        // ② JWT 로그인 필터 생성 — 성공/실패 핸들러 설정
        JwtLoginFilter filter = new JwtLoginFilter(
            authManager,
            jwtConfig.jwtSuccessHandler(),
            new SimpleUrlAuthenticationFailureHandler()
        );

        // ③ UsernamePasswordAuthenticationFilter 이전에 JWT 로그인 필터 등록
        http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
    }

    public static JwtLoginDsl customDsl(JwtConfig jwtConfig) {
        return new JwtLoginDsl(jwtConfig);
    }
}
