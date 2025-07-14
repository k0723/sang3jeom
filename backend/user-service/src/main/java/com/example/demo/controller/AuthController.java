package com.example.demo.controller;

import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserDto;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtTokenProvider;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.net.URI;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtProvider;
    private final UserService userService;
    private final AuthService authService;

    public AuthController(UserService userService,
                          AuthService authService,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtProvider) {
        this.userService = userService;
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtProvider = jwtProvider;
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
    public ResponseEntity<JwtResponse> login(@RequestBody @Valid LoginRequest req) {
        var authToken = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        var auth = authenticationManager.authenticate(authToken);
        String token = jwtProvider.generateToken(auth);
        long expiresIn = jwtProvider.getExpiryMs();
        return ResponseEntity.ok(new JwtResponse(token, expiresIn));
    }
}