package com.example.demo.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;
import java.util.Collection;      // ← 추가
import java.util.Collections;     // ← 추가

/**
 * JWT 로그인(Username/Password)와 OAuth2 로그인을 모두 지원하는
 * SecurityContext의 Principal 어댑터.
 */
public class PrincipalDetails implements OAuth2User, UserDetails {
    private final UserDetails userDetails;     // DomainUserDetails 또는 InMemoryUserDetails
    private final OAuth2User oauth2User;       // OAuth2UserAdapter or null

    public PrincipalDetails(UserDetails userDetails) {
        this.userDetails = userDetails;
        this.oauth2User = null;
    }

    public PrincipalDetails(OAuth2User oauth2User,
                            UserDetails userDetails) {
        this.oauth2User = oauth2User;
        this.userDetails = userDetails;
    }

    // --- UserDetails 메서드 위임 ---
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return userDetails.getAuthorities();
    }
    @Override public String getPassword() {
        return userDetails.getPassword();
    }
    @Override public String getUsername() {
        return userDetails.getUsername();
    }
    @Override public boolean isAccountNonExpired() {
        return userDetails.isAccountNonExpired();
    }
    @Override public boolean isAccountNonLocked() {
        return userDetails.isAccountNonLocked();
    }
    @Override public boolean isCredentialsNonExpired() {
        return userDetails.isCredentialsNonExpired();
    }
    @Override public boolean isEnabled() {
        return userDetails.isEnabled();
    }

    // --- OAuth2User 메서드 위임 ---
    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User != null
            ? oauth2User.getAttributes()
            : Map.of();
    }

    @Override
    public String getName() {
        return oauth2User != null
            ? oauth2User.getName()
            : userDetails.getUsername();
    }
}
