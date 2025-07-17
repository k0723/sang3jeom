package com.example.demo.config;

import com.example.demo.util.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Configuration
public class JwtConfig {

private final JwtTokenProvider jwtProvider;

public JwtConfig(JwtTokenProvider jwtProvider) {
    this.jwtProvider = jwtProvider;
}

@Bean
public AuthenticationSuccessHandler jwtSuccessHandler() {
    return (req, res, auth) -> {
        String token = jwtProvider.generateToken(auth);
        res.setStatus(HttpStatus.OK.value());
        res.setContentType("application/json");
        res.getWriter().write("{\"token\":\"" + token + "\"}");
    };
}

}