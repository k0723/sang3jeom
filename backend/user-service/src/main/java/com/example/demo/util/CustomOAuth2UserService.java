package com.example.demo.util;  // 위치 그대로 쓰셔도 되고, 더 명확히 하시려면 'service' 또는 'security' 패키지로 옮기셔도 좋습니다.


import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;

import com.example.demo.mapper.OAuth2UserMapper;        // mapper 위치에 맞춰 경로 조정
import com.example.demo.repository.UserRepository;
import com.example.demo.security.PrincipalDetails;      // 만든 위치에 맞춰 조정

@Service
public class CustomOAuth2UserService
      extends DefaultOAuth2UserService
      implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final OAuth2UserMapper mapper;
    private final UserRepository userRepo;

    public CustomOAuth2UserService(OAuth2UserMapper mapper,
                                   UserRepository userRepo) {
        this.mapper   = mapper;
        this.userRepo = userRepo;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauthUser = super.loadUser(userRequest);
        // 이메일로 기존 회원 조회, 없으면 최초 저장
        var userEntity = userRepo.findByEmail(oauthUser.getAttribute("email"))
            .orElseGet(() -> userRepo.save(mapper.toUser(oauthUser)));
        return new PrincipalDetails(userEntity, oauthUser.getAttributes());
    }
}
