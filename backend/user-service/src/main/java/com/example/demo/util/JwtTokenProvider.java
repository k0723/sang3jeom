package com.example.demo.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Component
public class JwtTokenProvider {

    @Getter
    private final long accessExpiryMs;
    @Getter
    private final long refreshExpiryMs;
    private final Key signingKey;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiry-ms}") long accessExpiryMs,
            @Value("${jwt.refresh-expiry-ms}") long refreshExpiryMs
    ) {
        this.signingKey     = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.accessExpiryMs = accessExpiryMs;
        this.refreshExpiryMs= refreshExpiryMs;
    }

    /* ===================== Create ===================== */

    public String createAccessToken(Long userId, String role) {
        return buildToken(userId, role, accessExpiryMs);
    }

    public String createRefreshToken(Long userId, String role) {
        return buildToken(userId, role, refreshExpiryMs);
    }

    private String buildToken(Long userId, String role, long ttlMs) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + ttlMs);
        String jti  = UUID.randomUUID().toString();

        return Jwts.builder()
                .setSubject(String.valueOf(userId))  // sub = userId
                .setId(jti)
                .claim("uid",  userId)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    /* ===================== Parse / Validate ===================== */

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                   .setSigningKey(signingKey)
                   .build()
                   .parseClaimsJws(token);
    }

    public Long getUserId(String token) {
        return parseToken(token).getBody().get("uid", Long.class);
    }

    public String getRole(String token) {
        return parseToken(token).getBody().get("role", String.class);
    }

    public String getJti(String token) {
        return parseToken(token).getBody().getId();
    }

    public long getRemainMillis(String token) {
        Date exp = parseToken(token).getBody().getExpiration();
        return exp.getTime() - System.currentTimeMillis();
    }

    /* ===================== Auth object ===================== */
    public Authentication getAuthentication(String token) {
        Claims claims = parseToken(token).getBody();
        Long   uid    = claims.get("uid", Long.class);
        String role   = claims.get("role", String.class);

        List<SimpleGrantedAuthority> auths =
                List.of(new SimpleGrantedAuthority(role));

        User principal = new User(String.valueOf(uid), "", auths);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, token, auths);
        auth.setDetails(uid);
        return auth;
    }

    /* ===================== Resolve from Request ===================== */
    public String resolveToken(HttpServletRequest request) {
        // Cookie 우선
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        // Authorization: Bearer ~
        String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
