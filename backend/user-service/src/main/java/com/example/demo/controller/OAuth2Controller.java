package com.example.demo.controller;

import com.example.demo.dto.JwtResponse;
import com.example.demo.service.AuthService;
import com.example.demo.util.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.io.IOException;

@RestController
public class OAuth2Controller {

    private final AuthService authService;
    private final JwtTokenProvider jwtProvider;

    public OAuth2Controller(AuthService authService,
                            JwtTokenProvider jwtProvider) {
        this.authService = authService;
        this.jwtProvider = jwtProvider;
    }

    @GetMapping("/api/oauth2/google/login")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }

    @GetMapping("/login/oauth2/code/google")
    public ResponseEntity<JwtResponse> callback(Authentication authentication) {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        authService.processOAuthPostLogin(oauthUser);
        String token = jwtProvider.generateToken(authentication);
        long expiresIn = jwtProvider.getExpiryMs();
        return ResponseEntity.ok(new JwtResponse(token, expiresIn));
    }
}
