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
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final TokenService tokenService;
    private final UserRepository userRepo;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        log.debug("[OAuth2SuccessHandler] success start");

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String provider = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();
        String providerId;
        if ("kakao".equals(provider)) {
            providerId = Objects.toString(oauth2User.getAttribute("id"), null);
        } else if ("google".equals(provider)) {
            providerId = Objects.toString(oauth2User.getAttribute("sub"), null); // ✅ 구글은 "sub"
        } else {
            log.error("Unknown provider: " + provider);
            response.sendError(HttpStatus.BAD_REQUEST.value(), "지원하지 않는 소셜 로그인입니다: " + provider);
            return;
        }

        if (providerId == null) {
            log.error("providerId is null from OAuth2User attributes");
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "OAuth2 인증 실패: providerId 없음");
            return;
        }

        // CustomOAuth2UserService에서 이미 회원가입/조회했으므로 여기선 provider+providerId 기준 조회만 하면 됨
        UserEntity user = userRepo.findByProviderAndProviderId(provider, providerId)
            .orElseThrow(() -> {
                log.error("OAuth2SuccessHandler: 인증된 사용자를 찾을 수 없습니다.");
                return new RuntimeException("OAuth2 인증된 사용자가 DB에 존재하지 않음");
            });

        String role = user.isRoles() ? "ROLE_ADMIN" : "ROLE_USER";
        JwtResponseDTO tokens = tokenService.issueTokens(user.getId(), role);
         tokenService.writeTokensAsCookies(tokens, response);

        // ✅ Access Token만 URL로 전달
        String redirectUrl = UriComponentsBuilder.fromUriString("https://sang3jeom.com/oauth2/redirect")
                .queryParam("accessToken", tokens.getAccessToken()) // 프론트에서 읽어서 로컬스토리지에 저장
                .build()
                .toUriString();

        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");

        log.debug("[OAuth2SuccessHandler] Redirecting to: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}

