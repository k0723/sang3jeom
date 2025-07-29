package com.example.demo.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;
import com.example.demo.util.JwtTokenProvider;

@Component
@RequiredArgsConstructor
public class CustomLogoutHandler implements LogoutHandler {
    private final JwtTokenProvider jwtProvider;
    private final RedisTemplate<String,String> redis;

    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        Cookie cookie = WebUtils.getCookie(request, "refreshToken");
        if (cookie != null) {
            String token = cookie.getValue();
            String jti   = jwtProvider.parseToken(token).getBody().getId();
            redis.delete(jti);
        }
    }
}
