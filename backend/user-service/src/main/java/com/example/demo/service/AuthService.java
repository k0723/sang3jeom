package com.example.demo.service;

import org.springframework.stereotype.Service;
import com.example.demo.util.JwtTokenProvider;
import com.example.demo.domain.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
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
                       @Value("${spring.jwt.expiration-ms}") long expirationMs) {
        this.userRepo = userRepo;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
        this.expirationMs = expirationMs;
    }

    /**
     * 로컬 로그인 수행 후 JWT 토큰과 만료 시간을 반환
     */
    public JwtResponse loginAndGetToken(LoginRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtProvider.createToken(user.getUsername(), user.getRoles());
        return new JwtResponse(token, expirationMs);
    }
}
