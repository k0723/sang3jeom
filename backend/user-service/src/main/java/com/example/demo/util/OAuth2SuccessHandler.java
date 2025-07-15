package com.example.demo.util;

import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.DomainUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtProvider;
    private final UserRepository userRepo;

    public OAuth2SuccessHandler(JwtTokenProvider jwtProvider, UserRepository userRepo) {
        this.jwtProvider = jwtProvider;
        this.userRepo = userRepo;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) 
                                        throws IOException {
        // 1) OAuth2User로부터 프로필 정보 꺼내기
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name  = oauth2User.getAttribute("name");
        String pictureUrl = oauth2User.getAttribute("picture");

        // 2) DB에서 User 조회, 없으면 새로 저장
        UserEntity  user = userRepo.findByEmail(email)
            .orElseGet(() -> {
                UserEntity newUser = UserEntity.builder()
                .email(email)
                    .username(name != null ? name : email)       // username 필수
                    .name(name != null ? name : email)           // 프로필 이름
                    .passwordHash("")                            // OAuth2 사용자이므로 빈 문자열
                    .roles(false)                                // 기본 ROLE_USER
                    .profileImageUrl(pictureUrl)                 // 프로필 이미지
                    .build();
                return userRepo.save(newUser);
            });

        // 3) JWT 토큰 생성
        String token = jwtProvider.createToken(email, user.isRoles());

        // 4) JSON 응답
        response.setStatus(HttpStatus.OK.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\"}");
    }
}
