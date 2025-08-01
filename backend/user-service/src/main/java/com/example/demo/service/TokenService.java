// src/main/java/com/example/demo/service/TokenService.java
package com.example.demo.service;

import com.example.demo.dto.JwtResponseDTO;
import com.example.demo.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtTokenProvider jwtProvider;
    private final RedisTemplate<String, String> redis;

    // -------- 발급 --------
    public JwtResponseDTO issueTokens(Long userId, String role) {
        String access  = jwtProvider.createAccessToken(userId, role);
        String refresh = jwtProvider.createRefreshToken(userId, role);

        // refresh jti 저장(옵션) or refresh 자체 저장
        String refreshJti = jwtProvider.parseToken(refresh).getBody().getId();
        long refreshTtlMs = jwtProvider.getRefreshExpiryMs();
        redis.opsForValue().set("refresh:" + refreshJti, userId.toString(), refreshTtlMs, TimeUnit.MILLISECONDS);

        return JwtResponseDTO.builder()
        .accessToken(access)
        .accessExpiresIn(jwtProvider.getAccessExpiryMs())
        .refreshToken(refresh)
        .refreshExpiresIn(jwtProvider.getRefreshExpiryMs())
        .build();
    }

    // -------- 쿠키 세팅 --------
    public void writeTokensAsCookies(JwtResponseDTO tokens, HttpServletResponse res) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokens.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(tokens.getAccessExpiresIn()/1000)
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(tokens.getRefreshExpiresIn()/1000)
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        res.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    // -------- 재발급 --------
    public JwtResponseDTO rotateAccessToken(String refreshToken) {
        // 1) 유효성 검증 + 블랙리스트 체크
        if (!jwtProvider.validateToken(refreshToken)) throw new IllegalArgumentException("refresh invalid");

        String jti = jwtProvider.parseToken(refreshToken).getBody().getId();
        if (redis.opsForValue().get("blacklist:" + jti) != null)
            throw new IllegalStateException("revoked token");

        Long userId = jwtProvider.getUserId(refreshToken);
        String role = jwtProvider.getRole(refreshToken);

        // 2) 새 access 발급 (refresh는 그대로)
        String newAccess = jwtProvider.createAccessToken(userId, role);

        return JwtResponseDTO.builder()
        .accessToken(newAccess)
        .accessExpiresIn(jwtProvider.getAccessExpiryMs())
        .refreshToken(refreshToken)   // 메서드 파라미터
        .refreshExpiresIn(jwtProvider.getRefreshExpiryMs())
        .build();
    }

    // -------- 무효화(로그아웃) --------
    public void revokeTokens(String accessToken, String refreshToken) {
        if (accessToken != null && jwtProvider.validateToken(accessToken)) {
            String jti = jwtProvider.parseToken(accessToken).getBody().getId();
            long ttl = jwtProvider.getRemainMillis(accessToken);
            redis.opsForValue().set("blacklist:" + jti, "1", ttl, TimeUnit.MILLISECONDS);
        }
        if (refreshToken != null && jwtProvider.validateToken(refreshToken)) {
            String jti = jwtProvider.parseToken(refreshToken).getBody().getId();
            long ttl = jwtProvider.getRemainMillis(refreshToken);
            redis.opsForValue().set("blacklist:" + jti, "1", ttl, TimeUnit.MILLISECONDS);
            redis.delete("refresh:" + jti);
        }
    }

    public void revokeTokenByJti(String jti) {
        // 블랙리스트에 등록 (만료시간은 적당히 지정: 1시간 예시)
        redis.opsForValue().set("blacklist:" + jti, "1", 3600, TimeUnit.SECONDS);
        // refresh 저장소에도 같은 키를 쓰고 있다면 삭제
        redis.delete("refresh:" + jti);
    }
    }
