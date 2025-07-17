package com.example.demo.util;

import com.example.demo.dto.LoginRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.util.Collections;

/**
 * JSON 기반 로그인 요청을 처리하는 필터
 */
public class JwtLoginFilter extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper mapper = new ObjectMapper();

    public JwtLoginFilter(AuthenticationManager authManager,
                          AuthenticationSuccessHandler successHandler,
                          AuthenticationFailureHandler failureHandler) {
        super.setAuthenticationManager(authManager);
        super.setAuthenticationSuccessHandler(successHandler);
        super.setAuthenticationFailureHandler(failureHandler);
        super.setFilterProcessesUrl("/login");
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
                                                throws AuthenticationException {
        System.out.println("[DEBUG] JwtLoginFilter.enter, contentType=" + request.getContentType());
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {
            System.out.println("[DEBUG] JSON 분기 진입");
            try (ServletInputStream inputStream = request.getInputStream()) {
                LoginRequestDTO creds = mapper.readValue(inputStream, LoginRequestDTO.class);
                System.out.println("[DEBUG] parsed email=" + creds.getEmail() + ", password=" + creds.getPassword());
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
        System.out.println("[DEBUG] FORM 분기로 fallback");
        return super.attemptAuthentication(request, response);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult)
                                            throws IOException, ServletException {
        getSuccessHandler().onAuthenticationSuccess(request, response, authResult);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed)
                                              throws IOException, ServletException {
        getFailureHandler().onAuthenticationFailure(request, response, failed);
    }
}
