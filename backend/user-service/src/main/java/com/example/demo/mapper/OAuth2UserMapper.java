package com.example.demo.mapper;

import org.springframework.stereotype.Component;
import com.example.demo.domain.UserEntity;
import java.util.List;  
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Map;

@Component
public class OAuth2UserMapper {
    public UserEntity toUser(OAuth2User oauthUser) {
        UserEntity user = new UserEntity();
        user.setEmail(oauthUser.getAttribute("email"));
        user.setUsername(oauthUser.getAttribute("name"));
        return user;
    }
}
