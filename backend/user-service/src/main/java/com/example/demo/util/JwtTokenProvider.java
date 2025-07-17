package com.example.demo.util;

import com.example.demo.util.JwtTokenProvider;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.core.user.OAuth2User;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;
import java.util.Date;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtTokenProvider {

    @Value("${JWT_SECRET}")
    private String secret;
    @Value("${JWT_EXPIRATION_MS}")
    private long expiryMs;

    private final UserDetailsService userDetailsService;

    public JwtTokenProvider(UserDetailsService uds) {
        this.userDetailsService = uds;
    }

    public long getExpiryMs() {
        return expiryMs;
    }

    public String generateToken(Authentication auth) {
        String username = auth.getName();
        Date now = new Date();
        Date exp = new Date(now.getTime() + expiryMs);
        return Jwts.builder()
                   .setSubject(username)
                   .setIssuedAt(now)
                   .setExpiration(exp)
                   .signWith(SignatureAlgorithm.HS512, secret)
                   .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (JwtException|IllegalArgumentException ex) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser().setSigningKey(secret)
                          .parseClaimsJws(token)
                          .getBody();
        String username = claims.getSubject();
        Boolean isAdmin = claims.get("roles",Boolean.class);
        Long userId = claims.get("id",Long.class);
        List<SimpleGrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority(isAdmin ? "ROLE_ADMIN" : "ROLE_USER")
        );

        // 3) UserDetails 없이, 빈 비밀번호("")로 User 객체 생성
        User principal = new User(username, "", authorities);

        // 4) UsernamePasswordAuthenticationToken 반환
        UsernamePasswordAuthenticationToken auth =
        new UsernamePasswordAuthenticationToken(principal, token, authorities);
        auth.setDetails(userId);  // 여기서 .getDetails()로 id를 꺼낼 수 있어요

        return auth;
    }
    public String createToken(String username, boolean roles, Long id) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);

        return Jwts.builder() 
                   .setSubject(username)
                   .claim("roles", roles)
                   .claim("id", id)
                   .setIssuedAt(now)
                   .setExpiration(expiry)
                   .signWith(SignatureAlgorithm.HS512, secret)
                   .compact();
    }

    public String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
