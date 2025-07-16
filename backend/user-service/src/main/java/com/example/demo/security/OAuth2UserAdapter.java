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

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public String getName() {
        // 식별자 용도로 ID나 이메일 등을 리턴
        Object sub = delegate.getAttributes().get("sub");
        return sub != null ? sub.toString() : delegate.getName();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
}
