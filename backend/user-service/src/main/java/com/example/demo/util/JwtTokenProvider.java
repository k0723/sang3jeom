package com.example.demo.util;

import com.example.demo.util.JwtTokenProvider;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils; 
import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import lombok.Getter;

import java.util.List;
import java.util.Date;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import java.util.Base64;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration-ms}")
    private long expiryMs;

    private final UserDetailsService userDetailsService;

    public JwtTokenProvider(UserDetailsService uds,
                            @Value("${jwt.secret}") String secret,
                            @Value("${jwt.expiration-ms}") long expiryMs
    ) 
    {
        this.secret = secret;
        this.expiryMs = expiryMs;
        this.userDetailsService = uds;

        System.out.printf("Injected secret=[%s], expiry=%d%n", secret, expiryMs);
    }

    public long getAccessExpiryMs() {
        return expiryMs;
    }

    public long getRefreshExpiryMs() {
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
                   .signWith(getSigningKey(),SignatureAlgorithm.HS512)
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
    public String createAccessToken(String username, boolean roles, Long id) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);
        String jti  = UUID.randomUUID().toString();

        return Jwts.builder() 
                   .setSubject(username)
                   .setId(jti)  
                   .claim("roles", roles)
                   .claim("id", id)
                   .setIssuedAt(now)
                   .setExpiration(expiry)
                   .signWith(getSigningKey(),SignatureAlgorithm.HS512)
                   .compact();
    }

    public String createRefreshToken(String username, Long id) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);
        String jti  = UUID.randomUUID().toString();
        return Jwts.builder() 
                   .setSubject(username)
                   .setId(jti)  
                   .claim("id", id)
                   .setIssuedAt(now)
                   .setExpiration(expiry)
                   .signWith(getSigningKey(),SignatureAlgorithm.HS512)
                   .compact();
    }

    public String resolveToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        // 2) Authorization 헤더에서 Bearer 토큰 추출
        String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    public Jws<Claims> parseToken(String token) throws JwtException {
        return Jwts.parserBuilder()
                   .setSigningKey(getSigningKey())
                   .build()
                   .parseClaimsJws(token);
    }

    private Key getSigningKey() {
        byte[] decodedKey = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(decodedKey);
    }
}
