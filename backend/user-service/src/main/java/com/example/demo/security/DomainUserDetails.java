package com.example.demo.security;

import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.example.demo.domain.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;      // ← 추가
import java.util.Collections;     // ← 추가

/**
 * 도메인 User 엔티티를 Spring Security의 UserDetails로 어댑터.
 */
public class DomainUserDetails implements UserDetails {
    private final User user;

    public DomainUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = user.isRoles() ? "ROLE_ADMIN" : "ROLE_USER";
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
