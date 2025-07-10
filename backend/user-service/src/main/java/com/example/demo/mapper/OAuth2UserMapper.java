package com.example.demo.mapper;

import org.springframework.stereotype.Component;
import com.example.demo.domain.User;
import java.util.List;  
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Map;

@Component
public class OAuth2UserMapper {
    public User toUser(OAuth2User oauthUser) {
        User user = new User();
        user.setEmail(oauthUser.getAttribute("email"));
        user.setUsername(oauthUser.getAttribute("name"));
        user.setRoles(List.of("ROLE_USER"));
        return user;
    }
}
