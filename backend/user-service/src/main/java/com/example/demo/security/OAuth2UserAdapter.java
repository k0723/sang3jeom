package com.example.demo.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

/**
 * OAuth2User.getAttributes() 만 노출하는 어댑터.
 */
@RequiredArgsConstructor
public class OAuth2UserAdapter implements OAuth2User {

    private final OAuth2User delegate;
    private final Collection<? extends GrantedAuthority> authorities;
    private final Long userId;

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getUserId() {
        return userId;
    }
}
