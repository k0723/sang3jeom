// src/main/java/com/example/demo/util/OAuth2LoginSuccessHandler.java
package com.example.demo.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtProvider;

    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        String username = authentication.getName();
        String token = jwtProvider.createToken(username, List.of("ROLE_USER"));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"token\":\"" + token + "\"}");
    }
}
