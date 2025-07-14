package com.example.demo.config;

import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtTokenFilter;
import com.example.demo.util.CustomOAuth2UserService;
import com.example.demo.util.OAuth2SuccessHandler;
import com.example.demo.util.JwtTokenProvider;
import com.example.demo.util.JwtLoginFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.*;
import org.springframework.security.web.util.matcher.AndRequestMatcher;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtProvider;

    public SecurityConfig(JwtTokenProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    /** 1: 로컬 JWT 로그인/회원가입 전용 체인 (/api/auth/**) */
    @Bean @Order(1)
    public SecurityFilterChain authChain(HttpSecurity http,
                                         AuthenticationManager authManager) throws Exception {
        http
            .securityMatcher("/api/auth/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtLoginFilter(
                    authManager,
                    jwtSuccessHandler(),
                    new SimpleUrlAuthenticationFailureHandler()
                ),
                UsernamePasswordAuthenticationFilter.class
            );
        return http.build();
    }

    /** 2: OAuth2 구글 전용 체인 (/api/oauth2/google/**) */
    @Bean @Order(2)
    public SecurityFilterChain oauth2Chain(
        HttpSecurity http,
        CustomOAuth2UserService oauth2UserService,
        OAuth2SuccessHandler oauth2SuccessHandler
    ) throws Exception {
        http
        // 이 체인이 처리할 URL 패턴들
        .securityMatcher(
            "/api/oauth2/google/**",
            "/oauth2/authorization/**",
            "/login/oauth2/code/*"
        )
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // 위 패턴은 모두 허용
            .requestMatchers(
                "/api/oauth2/google/**",
                "/oauth2/authorization/**",
                "/login/oauth2/code/*"
            ).permitAll()
        )
        .oauth2Login(oauth2 -> oauth2
            // 인가 요청 기본 URI
            .authorizationEndpoint(ae -> ae.baseUri("/oauth2/authorization"))
            // 콜백 경로 패턴
            .redirectionEndpoint(re -> re.baseUri("/login/oauth2/code/*"))
            .userInfoEndpoint(ui -> ui.userService(oauth2UserService))
            .successHandler(oauth2SuccessHandler)
        );
        return http.build();
    }



    /** 3: 그 외 보호된 리소스 체인 (/api/** 에서 위 두 경로 제외) */
    @Bean @Order(3)
    public SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 1) 위 두 체인의 경로는 먼저 모두 허용
                .requestMatchers(
                    "/api/auth/**",
                    "/api/oauth2/google/**"
                ).permitAll()
                // 2) 그 외 /api/** 모든 요청은 인증 필요
                .anyRequest().authenticated()
            )
            .addFilterAfter(
                new JwtTokenFilter(jwtProvider),
                UsernamePasswordAuthenticationFilter.class
            );
        return http.build();
    }

    private AuthenticationSuccessHandler jwtSuccessHandler() {
        return (req, res, auth) -> {
            String token = jwtProvider.generateToken(auth);
            res.setStatus(HttpStatus.OK.value());
            res.setContentType("application/json");
            res.getWriter().write("{\"token\":\"" + token + "\"}");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public OAuth2SuccessHandler oauth2SuccessHandler(UserRepository userRepo) {
        // JwtTokenProvider는 생성자 주입으로 이미 가지고 있으므로 바로 사용
        return new OAuth2SuccessHandler(jwtProvider, userRepo);
    }

}
