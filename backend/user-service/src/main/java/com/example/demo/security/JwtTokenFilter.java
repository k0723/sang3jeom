package com.example.demo.security;

import com.example.demo.util.JwtTokenProvider;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.Authentication;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

/**
 * 요청마다 JWT 토큰을 확인하여 유효하면 SecurityContext에 Authentication 객체를 세팅합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtProvider;
    private final RedisTemplate<String, String> redis;


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // 로그인·회원가입 API는 JWT 검사 필터를 건너뜀
        return path.startsWith("/api/auth/login")
            || path.startsWith("/api/auth/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {
        String token = jwtProvider.resolveToken(request);
        log.trace("JWT token={}", token);
        if (token != null && jwtProvider.validateToken(token)) {
            Jws<Claims> parsed = jwtProvider.parseToken(token);
            String jti = parsed.getBody().getId();

            // 1) 블랙리스트에 등록된 jti인지 체크
            if (Boolean.TRUE.equals(redis.hasKey("blacklist:" + jti))) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "토큰이 무효화되었습니다.");
                return;
            }

            // 2) 통과하면 인증 컨텍스트 설정
            Authentication auth = jwtProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }

}
