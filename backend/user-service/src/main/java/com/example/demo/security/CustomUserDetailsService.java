package com.example.demo.security;

import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@Primary
@RequiredArgsConstructor  // final 필드에 대한 생성자 자동 생성
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String role = user.isRoles() ? "ROLE_ADMIN" : "ROLE_USER";
        var authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())  // passwordHash 사용
            .authorities(authorities)
            .build();
    }
}
