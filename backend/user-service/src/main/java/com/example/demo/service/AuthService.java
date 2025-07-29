package com.example.demo.service;

import com.example.demo.domain.UserEntity;
import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.JwtResponseDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtTokenProvider;
import com.example.demo.dto.JwtResponseDTO;
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


    /**
     * 로컬 로그인: 이메일/비밀번호 검증 후 JWT 발급
     */
    @Transactional
    public UserEntity login(LoginRequestDTO req) {
        UserEntity user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다."));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다.");
        }
        return user;
    }

    /**
     * 구글 OAuth2 로그인 처리:
     * 신규 사용자면 회원가입, 기존 사용자면 조회 후 DTO 반환
     */
    @Transactional
    public UserEntity processOAuthPostLogin(OAuth2User oauth2User, String provider) {
        String providerId = oauth2User.getAttribute("id").toString();
        String email = oauth2User.getAttribute("email");              // 공통 이메일
        String username = oauth2User.getAttribute("name"); 

        
        Map<String, Object> attributes = oauth2User.getAttributes();
        Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account"); 

        String profileImage = (account != null && account.containsKey("profile"))
        ? (String) ((Map<String, Object>) account.get("profile")).get("profile_image_url")
        : oauth2User.getAttribute("picture"); // Google 등 fallbackc

        return userRepo.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {
                    UserEntity newUser = UserEntity.builder()
                            .provider(provider)
                            .providerId(providerId)
                            .email(email)
                            .username(oauth2User.getAttribute("name"))
                            .name(oauth2User.getAttribute("name"))
                            .passwordHash("")
                            .roles(false)
                            .profileImageUrl(profileImage)
                            .build();
                    log.info("New OAuth2 user registered: {}", email);
                    return userRepo.save(newUser);
                });
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

    public boolean revokeTokenByJti(String jti) {
        // 화이트리스트 삭제
        Boolean deleted = redis.delete(jti);
        // 블랙리스트에도 올려두면 안전
        redis.opsForValue().set("bl:" + jti, "revoked", 3600, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(deleted);
    }

    
}
