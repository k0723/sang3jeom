package com.example.demo.service;

import com.example.demo.domain.UserEntity;
import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.JwtResponseDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.redis.core.RedisTemplate;

import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.Map;

/**
 * 인증·인가 관련 비즈니스 로직을 담당합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository    userRepo;
    private final JwtTokenProvider  jwtProvider;
    private final PasswordEncoder   passwordEncoder;
    private final RedisTemplate<String,String> redis;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    /**
     * 로컬 로그인: 이메일/비밀번호 검증 후 JWT 발급
     */
    @Transactional(rollbackOn = Exception.class)
    public JwtResponseDTO loginAndGetToken(LoginRequestDTO req) {
        UserEntity user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다.");
        }

        String accessToken = jwtProvider.createAccessToken(user.getEmail(), user.isRoles(), user.getId());
        String refreshToken = jwtProvider.createRefreshToken(user.getEmail(), user.getId());
        log.info("User '{}' logged in, JWT issued", user.getEmail());

        Jws<Claims> parsed = jwtProvider.parseToken(refreshToken);
        String jti        = parsed.getBody().getId();
        Date expiry       = parsed.getBody().getExpiration();
        long ttlSeconds   = (expiry.getTime() - System.currentTimeMillis()) / 1000;
        redis.opsForValue().set(jti, String.valueOf(user.getId()), ttlSeconds, TimeUnit.SECONDS);

        return JwtResponseDTO.builder()
            .accessToken(accessToken)
            .accessExpiresIn(jwtProvider.getAccessExpiryMs())
            .refreshToken(refreshToken)
            .refreshExpiresIn(jwtProvider.getRefreshExpiryMs())
            .build();
    }

    /**
     * 구글 OAuth2 로그인 처리:
     * 신규 사용자면 회원가입, 기존 사용자면 조회 후 DTO 반환
     */
    @Transactional
    public UserDTO processOAuthPostLogin(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        UserEntity user = userRepo.findByEmail(email)
            .orElseGet(() -> {
                UserEntity newUser = UserEntity.builder()
                    .email(email)
                    .name(oauthUser.getAttribute("name"))
                    .roles(false)
                    .profileImageUrl(oauthUser.getAttribute("picture"))
                    .build();
                log.info("New OAuth2 user registered: {}", email);
                return userRepo.save(newUser);
            });
        return UserDTO.fromOAuth2(user);
    }

    /**
     * HTTP 요청 헤더에서 Bearer 토큰을 꺼냅니다.
     */
    public String resolveToken(HttpServletRequest request) {
        return jwtProvider.resolveToken(request);
    }

    /**
     * 토큰 유효성을 검사합니다.
     */
    public boolean validateToken(String token) {
        return jwtProvider.validateToken(token);
    }

    public void logout(String refreshToken) {
        // 1) 토큰 파싱 (서명 검증 + 만료 검증 포함)
        Jws<Claims> parsed = jwtProvider.parseToken(refreshToken);
        String jti = parsed.getBody().getId();

        // 2) Redis에서 세션 무효화 (키 삭제)
        Boolean existed = redis.delete(jti);
        if (Boolean.FALSE.equals(existed)) {
            // (선택) 이미 만료되었거나 없었던 키인 경우 로깅
            log.warn("Logout attempted for non-existent jti: {}", jti);
        }
    }
}
