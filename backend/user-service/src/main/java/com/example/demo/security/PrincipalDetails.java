package com.example.demo.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.AllArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

/**
 * JWT 로그인(Username/Password)와 OAuth2 로그인을 모두 지원하는
 * SecurityContext의 Principal 어댑터.
 */
@AllArgsConstructor
@Getter
public class PrincipalDetails implements OAuth2User, UserDetails {

    /**
     * 내부적으로 인증된 사용자 정보:
     * - 일반 로그인 시 DomainUserDetails
     * - OAuth2 로그인 시 OAuth2UserAdapter
     */
    private final UserDetails userDetails;

    /**
     * OAuth2 로그인 시에만 non-null.
     */
    private final OAuth2User oauth2User;

    /**
     * 일반(폼) 로그인 전용 생성자.
     */

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
            : Collections.emptyMap();
    }

    @Override
    public String getName() {
        return oauth2User != null
            ? oauth2User.getName()
            : userDetails.getUsername();
    }
}
