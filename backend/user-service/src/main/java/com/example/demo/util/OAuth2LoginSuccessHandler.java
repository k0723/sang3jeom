// src/main/java/com/example/demo/util/OAuth2LoginSuccessHandler.java
package com.example.demo.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserRepository;

import java.io.IOException;
import java.util.List;


@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtProvider;
    private final UserRepository userRepo;

    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtProvider,
                                     UserRepository userRepo) {
        this.jwtProvider = jwtProvider;
        this.userRepo = userRepo;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        UserEntity user = userRepo.findByEmail(email)
            .orElseGet(() -> {
                UserEntity u = UserEntity.builder()
                    .email(email)
                    .username(email)
                    .name(oauth2User.getAttribute("name"))
                    .passwordHash("")       // OAuth2 유저이므로 빈 문자열
                    .roles(false)
                    .profileImageUrl(oauth2User.getAttribute("picture"))
                    .build();
                return userRepo.save(u);
            });

        String username = authentication.getName();
        Long id = user.getId();
        String token = jwtProvider.createAccessToken(username, false, id);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"token\":\"" + token + "\"}");
    }
}
