package com.example.demo.security;

import com.example.demo.repository.UserRepository;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.example.demo.domain.User;
import com.example.demo.repository.UserRepository;
import org.springframework.context.annotation.Primary; 
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;


@Service  // 빈으로 자동 등록 
@Primary
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;

    public CustomUserDetailsService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() ->  new UsernameNotFoundException("User not found: " + email));
        String role = user.isRoles() ? "ROLE_ADMIN" : "ROLE_USER";
        var authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }
}
