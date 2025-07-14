package com.example.demo.util;

import com.example.demo.domain.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.DomainUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

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
                                        Authentication authentication) throws IOException {
        // 1) 인증된 principal에서 이메일(또는 username) 꺼내기
        String email = authentication.getName();

        // 2) DB에서 User 조회
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("User not found: " + email));

        // 3) boolean roles 플래그 기준으로 토큰 생성
        boolean isAdmin = user.isRoles();
        String token = jwtProvider.createToken(email, isAdmin);

        // 4) JSON 응답
        response.setStatus(HttpStatus.OK.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\"}");
    }
}
