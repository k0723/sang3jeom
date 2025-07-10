package com.example.demo.config;

import com.example.demo.util.CustomOAuth2UserService;
import com.example.demo.util.JwtTokenFilter;
import com.example.demo.util.JwtTokenProvider;
import com.example.demo.util.OAuth2LoginSuccessHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtTokenProvider jwtProvider;
    private final CustomOAuth2UserService oAuth2UserService;
    private final OAuth2LoginSuccessHandler successHandler;

    public SecurityConfig(JwtTokenProvider jwtProvider,
                          CustomOAuth2UserService oAuth2UserService,
                          OAuth2LoginSuccessHandler successHandler) {
        this.jwtProvider       = jwtProvider;
        this.oAuth2UserService = oAuth2UserService;
        this.successHandler    = successHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(u -> u.userService(oAuth2UserService))
                .successHandler(successHandler)
            )
            .addFilterBefore(new JwtTokenFilter(jwtProvider),
                             UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
