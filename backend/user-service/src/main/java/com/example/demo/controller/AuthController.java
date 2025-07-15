package com.example.demo.controller;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.JwtResponseDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtTokenProvider;
import com.example.demo.domain.UserEntity;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.core.user.OAuth2User;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;


import java.io.IOException;
import java.net.URI;

@RestController
@Tag(name = "Authentication", description = "인증 관련 API")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtProvider;

    public AuthController(
            UserService userService,
            AuthService authService,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtProvider
    ) {
        this.userService = userService;
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtProvider = jwtProvider;
    }

    @Operation(summary = "회원가입", description = "이메일/비밀번호로 신규 사용자 등록")
    @PostMapping("/signup")
    public ResponseEntity<UserDTO> register(
            @RequestBody @Valid UserCreateRequestDTO req
    ) {
        UserDTO created = userService.create(req);
        // URI는 실제 UserController의 매핑에 맞추거나, 프론트에서 유저 조회 경로를 알고 있으면 적절히 설정
        return ResponseEntity
                .created(URI.create("/users/" + created.getId()))
                .body(created);
    }

    @Operation(summary = "로그인", description = "이메일/비밀번호로 로그인하고 JWT 발급")
    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(
            @RequestBody @Valid LoginRequestDTO req
    ) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        Authentication auth = authenticationManager.authenticate(authToken);
        String token = jwtProvider.generateToken(auth);
        long expiresIn = jwtProvider.getExpiryMs();
        return ResponseEntity.ok(new JwtResponseDTO(token, expiresIn));
    }

    @Operation(summary = "OAuth2 인가 시작", description = "소셜 로그인(provider) 인가 URL로 리다이렉트")
    @GetMapping("/providers/{provider}")
    @ResponseStatus(HttpStatus.FOUND)
    public void redirectToProvider(
            @PathVariable String provider,
            HttpServletResponse response
    ) throws IOException {
        if (!provider.matches("google|kakao")) {
            response.sendError(HttpStatus.BAD_REQUEST.value(),
                               "지원하지 않는 provider: " + provider);
            return;
        }
        response.sendRedirect("/oauth2/authorization/" + provider);
    }

    @Operation(summary = "OAuth2 콜백", description = "소셜 로그인 후 콜백을 받아 JWT 발급")
    @GetMapping("/callback/{provider}")
    public ResponseEntity<JwtResponseDTO> callback(
            @PathVariable String provider,
            Authentication authentication
    ) {
        // UserDetails 객체를 다루는 AuthService 로직에 맞춰 cast/처리
        OAuth2User oauth2 = (OAuth2User) authentication.getPrincipal();
        authService.processOAuthPostLogin(oauth2);
        String token = jwtProvider.generateToken(authentication);
        long expiresIn = jwtProvider.getExpiryMs();
        return ResponseEntity.ok(new JwtResponseDTO(token, expiresIn));
    }
}
