package com.example.demo.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;      // ← 추가
import java.util.Collections;     // ← 추가
import java.util.Map;

/**
 * OAuth2User.getAttributes() 만 노출하는 어댑터.
 */
public class OAuth2UserAdapter implements OAuth2User {
    private final OAuth2User delegate;
    private final Collection<? extends GrantedAuthority> authorities;

    public OAuth2UserAdapter(OAuth2User delegate,
                             Collection<? extends GrantedAuthority> authorities) {
        this.delegate = delegate;
        this.authorities = authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public String getName() {
        // 식별자 용도로 ID나 이메일 등을 리턴
        Object name = delegate.getAttributes().get("sub");
        return name != null ? name.toString() : delegate.getName();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
}
