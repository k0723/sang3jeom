package com.example.demo.controller;

import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserDto;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    public AuthController(UserService userService,
                          AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    /**
     * 로컬 회원가입
     */
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(
            @RequestBody @Valid UserCreateRequest req) {
        UserDto created = userService.create(req);
        return ResponseEntity
                .created(URI.create("/api/users/" + created.getId()))
                .body(created);
    }

    /**
     * 로컬 로그인: JWT 토큰 발급
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @RequestBody @Valid LoginRequest req) {
        JwtResponse token = authService.loginAndGetToken(req);
        return ResponseEntity.ok(token);
    }

    // (OAuth2 로그인은 SecurityConfig/OAuth2LoginSuccessHandler 에서 처리)
}
