package com.example.demo.config;

import com.example.demo.security.JwtTokenFilter;
import com.example.demo.util.CustomOAuth2UserService;
import com.example.demo.util.OAuth2SuccessHandler;
import com.example.demo.security.CustomLogoutHandler;
import com.example.demo.util.JwtLoginFilter;
import com.example.demo.util.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;   // ★ 추가
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.web.util.WebUtils;
import org.springframework.data.redis.core.RedisTemplate;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.Cookie; 
import org.springframework.security.web.authentication.logout.LogoutFilter;


import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final JwtTokenProvider jwtProvider;
  private final JwtTokenFilter jwtTokenFilter;
  private final RedisTemplate<String,String> redis;
  private final CustomLogoutHandler customLogoutHandler;
  /**
   * 1) OAuth2 로그인만 처리하는 체인 (세션 ON)
   *    - "/oauth2/authorization/**", "/login/oauth2/code/**", "/error" 요청은
   *      OAuth2LoginFilter 체인으로만 처리하도록 분리 (@Order(1))
   */
  @Bean
  @Order(1)
  public SecurityFilterChain apiAndCatchAllChain(HttpSecurity http,
                                                 AuthenticationManager authManager,
                                                 JwtTokenProvider jwtProvider,
                                                 JwtConfig jwtConfig) throws Exception {

    JwtLoginFilter jwtLoginFilter = new JwtLoginFilter(
        authManager,
        jwtConfig.jwtSuccessHandler(),
        new SimpleUrlAuthenticationFailureHandler()
    );

    http
      // "/logout" 포함해서 API 전체(예: "/users/**")와 logout을 매칭
      .securityMatcher("/users/**", "/logout")
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint(
          new LoginUrlAuthenticationEntryPoint("/oauth2/authorization/google")
        )
      )
      .authorizeHttpRequests(auth -> auth
        // 열어둘 경로
        .requestMatchers(
          "/signup",
          "/login",
          "/refresh",
          "/logout",               // ← 여기
          "/oauth2/**",
          "/swagger-ui/**",
          "/v3/api-docs/**"
        ).permitAll()
        .anyRequest().authenticated()
      )
      // JWT 로그인/토큰 필터
      .addFilterBefore(jwtLoginFilter,
                       UsernamePasswordAuthenticationFilter.class)
      .addFilterBefore(new JwtTokenFilter(jwtProvider), 
                       LogoutFilter.class)
      .logout(logout -> logout
      .logoutUrl("/logout")
      .addLogoutHandler(customLogoutHandler)                 // (2)
      .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
      .deleteCookies("accessToken","refreshToken","JSESSIONID")
      .invalidateHttpSession(true)
      .permitAll()
    );
    return http.build();
  }

  // —————————————— OAuth2 전용 체인 (우선순위 2) ——————————————
  @Bean
  @Order(2)
  public SecurityFilterChain oauth2LoginChain(HttpSecurity http,
                                              CustomOAuth2UserService userService,
                                              OAuth2SuccessHandler successHandler) throws Exception {
    http
      .securityMatcher("/oauth2/**", "/oauth2/redirection/*", "/error")
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
      .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
      .oauth2Login(oauth2 -> oauth2
         .loginPage("/oauth2/authorization/google")
         .authorizationEndpoint(ae -> ae.baseUri("/oauth2/authorization"))
         .redirectionEndpoint(re -> re.baseUri("/oauth2/redirection/*"))
         .userInfoEndpoint(ui -> ui.userService(userService))
         .successHandler(successHandler)
         .failureUrl("/oauth2/authorization/google?error")
      )
    ;
    return http.build();
  }

  // JWT 로그인 성공 시 JSON 응답으로 토큰을 내려주는 핸들러
  private org.springframework.security.web.authentication.AuthenticationSuccessHandler jwtSuccessHandler(JwtTokenProvider jwtProvider) {
    return (req, res, auth) -> {
      String token = jwtProvider.generateToken(auth);
      res.setContentType("application/json");
      res.getWriter().write("{\"token\":\"" + token + "\"}");
    };
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
    return cfg.getAuthenticationManager();
  }

  @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
