package com.example.demo.util;

import com.example.demo.util.JwtTokenProvider;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Date;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration-ms}")
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
        String username = Jwts.parser().setSigningKey(secret)
                          .parseClaimsJws(token)
                          .getBody().getSubject();
        var userDetails = userDetailsService.loadUserByUsername(username);
        return new UsernamePasswordAuthenticationToken(
            userDetails, "", userDetails.getAuthorities());
    }
    public String createToken(String username, boolean roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);

        return Jwts.builder()
                   .setSubject(username)
                   .claim("roles", roles)
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
