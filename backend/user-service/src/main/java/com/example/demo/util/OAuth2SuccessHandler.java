package com.example.demo.util;

import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.DomainUserDetails;
import com.example.demo.service.TokenService;
import com.example.demo.dto.JwtResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import java.util.Map;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler  {

    private final TokenService tokenService;
    private final UserRepository userRepo;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        log.debug("[OAuth2SuccessHandler] success start");
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String provider = ((OAuth2AuthenticationToken)authentication)
                                                            .getAuthorizedClientRegistrationId();

        Map<String, Object> attributes = oauth2User.getAttributes();
        if (provider.equals("kakao")) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
            Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;
            String nickname = profile != null ? (String) profile.get("nickname") : null;
        }
        String email = oauth2User.getAttribute("email");
        String name  = oauth2User.getAttribute("name");
        String pic   = oauth2User.getAttribute("picture");

        UserEntity user = userRepo.findByEmail(email).orElseGet(() -> userRepo.save(
                UserEntity.builder()
                        .email(email)
                        .username(name != null ? name : email)
                        .name(name != null ? name : email)
                        .passwordHash("")
                        .roles(false)
                        .profileImageUrl(pic)
                        .build()
        ));

        String role = user.isRoles() ? "ROLE_ADMIN" : "ROLE_USER";
        JwtResponseDTO tokens = tokenService.issueTokens(user.getId(), role);
        tokenService.writeTokensAsCookies(tokens, response);

        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");

        response.sendRedirect("http://localhost:5173/oauth2/redirect");
    }
}
