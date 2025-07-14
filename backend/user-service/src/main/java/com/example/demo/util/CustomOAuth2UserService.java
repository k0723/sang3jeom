package com.example.demo.util;

import com.example.demo.domain.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.OAuth2UserAdapter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepo;

    // ✅ delegate 제거: UserRepository만 주입
    public CustomOAuth2UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {
        // 내부에서 직접 생성
        OAuth2User oauthUser = new DefaultOAuth2UserService().loadUser(userRequest);

        // (생략) 기존 사용자 조회/저장 로직
        User userEntity = userRepo.findByEmail(oauthUser.getAttribute("email"))
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(oauthUser.getAttribute("email"));
                newUser.setPassword("");
                newUser.setName(oauthUser.getAttribute("name"));
                newUser.setRoles(false);
                return userRepo.save(newUser);
            });

        List<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(userEntity.isRoles() ? "ROLE_ADMIN" : "ROLE_USER")
        );

        return new OAuth2UserAdapter(oauthUser, authorities);
    }
}
