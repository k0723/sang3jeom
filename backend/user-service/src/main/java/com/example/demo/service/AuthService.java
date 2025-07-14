package com.example.demo.service;

import com.example.demo.domain.User;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.UserDto;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final JwtTokenProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final long expirationMs;

    public AuthService(UserRepository userRepo,
                       JwtTokenProvider jwtProvider,
                       PasswordEncoder passwordEncoder,
                       @Value("${jwt.expiration-ms}") long expirationMs) {
        this.userRepo = userRepo;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
        this.expirationMs = expirationMs;
    }

    /**
     * 로컬 로그인: 사용자 인증 후 JWT 발급
     */
    public JwtResponse loginAndGetToken(LoginRequest req) {
        // 이메일로 사용자 조회
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다."));

        // 비밀번호 검증 (hash 비교)
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다.");
        }

        // JWT 생성 (email, roles)
        String token = jwtProvider.createToken(user.getEmail(), user.isRoles());
        return new JwtResponse(token, expirationMs);
    }

    /**
     * 구글 OAuth2 로그인 처리: 신규 사용자면 가입, 기존 사용자면 조회
     */
    public UserDto processOAuthPostLogin(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        User user = userRepo.findByEmail(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                // OAuth2User.getAttribute 반환값을 String으로 캐스팅하여 nickname 세팅
                newUser.setNickname((String) oauthUser.getAttribute("name"));
                return userRepo.save(newUser);
            });
        // OAuth2 전용 부분 매핑: nickname만 포함
        return UserDto.fromOAuth2(user);
    }

    /**
     * HTTP 요청 헤더에서 JWT 토큰 꺼내기
     */
    public String resolveToken(HttpServletRequest request) {
        return jwtProvider.resolveToken(request);
    }

    /**
     * 토큰 유효성 검사
     */
    public boolean validateToken(String token) {
        return jwtProvider.validateToken(token);
    }
}
