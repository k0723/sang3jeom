package com.example.demo.util;

import com.example.demo.domain.UserEntity;
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

import java.util.Objects;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepo;

    public CustomOAuth2UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oauthUser = new DefaultOAuth2UserService().loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // kakao, google, etc.
        System.out.println(">> 로그인 요청한 provider: " + provider);
        String providerId = null;
        String email = "";
        String name = "";

        if ("kakao".equals(provider)) {
            providerId = Objects.toString(oauthUser.getAttribute("id"), null);

            Map<String, Object> kakaoAccount = (Map<String, Object>) oauthUser.getAttribute("kakao_account");
            Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;

            email = kakaoAccount != null && kakaoAccount.get("email") != null
                    ? (String) kakaoAccount.get("email")
                    : "kakao";
            name = profile != null ? (String) profile.get("nickname") : "";

        } else if ("google".equals(provider)) {
            providerId = Objects.toString(oauthUser.getAttribute("sub"), null); // Google은 'sub'이 고유 ID
            email = Objects.toString(oauthUser.getAttribute("email"), "");
            name = Objects.toString(oauthUser.getAttribute("name"), "");

        } else {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인입니다: " + provider);
        }

        if (providerId == null) {
            throw new OAuth2AuthenticationException("소셜 로그인 식별자(providerId)가 존재하지 않습니다.");
        }

        Optional<UserEntity> optionalUser = userRepo.findByProviderAndProviderId(provider, providerId);
        UserEntity userEntity;
        
        if(optionalUser.isPresent()) {
            userEntity = optionalUser.get(); 
        }
        else{
            UserEntity newUser = new UserEntity();
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setUsername(provider + "_" + providerId);
            newUser.setPasswordHash(""); // 소셜 로그인은 패스워드 없음
            newUser.setRoles(false);
            userEntity = userRepo.save(newUser);
        }

        List<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(userEntity.isRoles() ? "ROLE_ADMIN" : "ROLE_USER")
        );

        return new OAuth2UserAdapter(oauthUser, authorities, userEntity.getId());
    }
}
