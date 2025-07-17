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

        String token = jwtProvider.createToken(user.getEmail(), user.isRoles());
        log.info("User '{}' logged in, JWT issued", user.getEmail());
        return new JwtResponseDTO(token, expirationMs);
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
}
