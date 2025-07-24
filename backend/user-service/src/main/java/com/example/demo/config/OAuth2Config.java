package com.example.demo.config;

import com.example.demo.repository.UserRepository;
import com.example.demo.util.CustomOAuth2UserService;
import com.example.demo.util.OAuth2SuccessHandler;
import com.example.demo.util.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OAuth2Config {

    @Bean
    public CustomOAuth2UserService customOAuth2UserService(UserRepository userRepo) {
        return new CustomOAuth2UserService(userRepo);
    }
}