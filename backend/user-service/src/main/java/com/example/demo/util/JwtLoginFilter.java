package com.example.demo.util;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.JwtResponseDTO;
import com.example.demo.service.TokenService;
import com.example.demo.security.DomainUserDetails;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collections;



public class JwtLoginFilter extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper mapper = new ObjectMapper();
    private final TokenService tokenService;

    public JwtLoginFilter(AuthenticationManager authManager,
                          TokenService tokenService) {
        this.tokenService = tokenService;
        super.setAuthenticationManager(authManager);
        super.setFilterProcessesUrl("/login"); // JSON 로그인 엔드포인트
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {

        String contentType = request.getContentType();
        if (contentType != null &&
            contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {

            try (ServletInputStream is = request.getInputStream()) {
                LoginRequestDTO creds = mapper.readValue(is, LoginRequestDTO.class);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                creds.getEmail(),
                                creds.getPassword(),
                                Collections.emptyList()
                        );
                setDetails(request, authToken);
                return this.getAuthenticationManager().authenticate(authToken);

            } catch (IOException e) {
                throw new AuthenticationServiceException("Invalid JSON login request", e);
            }
        }
        // fallback: form 로그인
        return super.attemptAuthentication(request, response);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult)
            throws IOException, ServletException {

        // principal 에서 userId/role 꺼내는 방식은 프로젝트에 맞춰 수정
        DomainUserDetails principal = (DomainUserDetails) authResult.getPrincipal();
        Long userId = principal.getId();
        String role = principal.getAuthorities().iterator().next().getAuthority();

        JwtResponseDTO tokens = tokenService.issueTokens(userId, role);
        tokenService.writeTokensAsCookies(tokens, response);

        // JSON 바디로도 내려주고 싶다면:
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getWriter(), tokens);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed)
            throws IOException, ServletException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getWriter(),
                Collections.singletonMap("error", failed.getMessage()));
    }
}
