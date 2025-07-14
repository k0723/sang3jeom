package com.example.demo.security;

import com.example.demo.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtTokenFilter extends OncePerRequestFilter {

    // 필드 이름을 jwtProvider로 통일
    private final JwtTokenProvider jwtProvider;

    public JwtTokenFilter(JwtTokenProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // 로그인·회원가입 요청은 필터 건너뛰기
        return path.startsWith("/api/auth/login")
            || path.startsWith("/api/auth/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {
        // resolveToken 메서드 추가 후 호출 가능
        String token = jwtProvider.resolveToken(request);
        if (token != null && jwtProvider.validateToken(token)) {
            var auth = jwtProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }
}
