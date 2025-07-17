package com.example.demo.config;

import com.example.demo.security.JwtTokenFilter;
import com.example.demo.util.CustomOAuth2UserService;
import com.example.demo.util.OAuth2SuccessHandler;
import com.example.demo.util.JwtLoginFilter;
import com.example.demo.util.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  /**
   * 1) OAuth2 로그인만 처리하는 체인 (세션 ON)
   *    - "/oauth2/authorization/**", "/login/oauth2/code/**", "/error" 요청은
   *      OAuth2LoginFilter 체인으로만 처리하도록 분리 (@Order(1))
   */
  @Bean @Order(1)
  public SecurityFilterChain oauth2LoginChain(HttpSecurity http,
                                              CustomOAuth2UserService userService,
                                              OAuth2SuccessHandler successHandler) throws Exception {
    http
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      // ★ 이 체인에서 처리할 URL 패턴을 한정
      .securityMatcher("/oauth2/**",
                       "/oauth2/redirection/*",
                       "/error")

      .csrf(csrf -> csrf.disable())
      // ★ OAuth2 flow 는 세션이 필요하므로 IF_REQUIRED
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

      // 아무나 접근 가능
      .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())

      .oauth2Login(oauth2 -> oauth2
        // ★ 커스텀 로그인 페이지를 구글 인가 시작 URI로 지정
        .loginPage("/oauth2/authorization/google")

        // ★ 인가 요청 기본 URI
        .authorizationEndpoint(ae -> ae.baseUri("/oauth2/authorization"))
        // ★ 콜백 URI 패턴
        .redirectionEndpoint(re -> re.baseUri("/oauth2/redirection/*"))

        .userInfoEndpoint(ui -> ui.userService(userService))
        .successHandler(successHandler)
        // ★ 로그인 실패 시 리다이렉트할 URL
        .failureUrl("/oauth2/authorization/google?error")
      );
    return http.build();
  }

  /**
   * 2) JWT API + catch‑all 체인 (STATLESS)
   *    - /api/** 및 그 외 모든 요청에 대해 이 체인이 처리
   *    - 인증이 필요한 요청은 구글 OAuth2 flow 로 강제 리다이렉트
   */
  @Bean @Order(2)
  public SecurityFilterChain apiAndCatchAllChain(HttpSecurity http,
                                                 AuthenticationManager authManager,
                                                 JwtTokenProvider jwtProvider,
                                                 JwtConfig jwtConfig) throws Exception {

    // JwtLoginFilter 인스턴스 생성 (여기에서 변수를 선언)
    JwtLoginFilter jwtLoginFilter = new JwtLoginFilter(
        authManager,
        jwtConfig.jwtSuccessHandler(),
        new SimpleUrlAuthenticationFailureHandler()
    );

    http
      .securityMatcher("/users/**")
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      // ★ JWT 체인은 무상태(stateless)
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

      // ★ 인증 안 된 접근은 /oauth2/authorization/google 으로 리다이렉트
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint(
          new LoginUrlAuthenticationEntryPoint("/oauth2/authorization/google")
        )
      )

      .authorizeHttpRequests(auth -> auth
        // JWT 로그인·회원가입, OAuth2 시작·콜백, 스웨거 등은 열어두기
        .requestMatchers(
          "/signup",             // 일반(폼) 회원가입
          "/login",              // 일반(폼) 로그인
          "/api/auth/register",  // 만약 이 경로를 사용 중이라면
          "/api/auth/login",     // 만약 이 경로를 사용 중이라면

          // OAuth2 흐름 시작·콜백
          "/oauth2",
          "/oauth2/redirection",
          "/oauth2/redirection/*", 

          // Swagger, OpenAPI, Actuator
          "/swagger-ui/**",
          "/v3/api-docs/**",
          "/actuator/**"
        ).permitAll()

        // 그 외는 모두 인증 필요
        .anyRequest().authenticated()
      )

      // ★ JWT 폼 로그인 필터 (Username/Password → JWT 발급)
      .addFilterBefore(jwtLoginFilter,
                       UsernamePasswordAuthenticationFilter.class)
      .addFilterBefore(new JwtTokenFilter(jwtProvider),
                       UsernamePasswordAuthenticationFilter.class);

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
