package com.example.demo.security;

import com.example.demo.domain.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class DomainUserDetails implements UserDetails {

    private final UserEntity user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // roles가 true면 ADMIN, 아니면 USER
        String role = user.isRoles() ? "ROLE_ADMIN" : "ROLE_USER";
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        // passwordHash 필드 사용
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        // 로그인 식별자로 쓰는 username 필드
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        // 필요시 로직 추가
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // 필요시 로직 추가
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // 필요시 로직 추가
        return true;
    }

    @Override
    public boolean isEnabled() {
        // 필요시 가입취소 등 로직 추가
        return true;
    }

}
