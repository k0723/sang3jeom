package com.example.demo.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.dto.LoginRequest;

import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collections;

public class JsonUsernamePasswordAuthenticationFilter
        extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {

        // JSON 요청인지 확인
        if (MediaType.APPLICATION_JSON_VALUE.equals(request.getContentType())) {
            try (ServletInputStream is = request.getInputStream()) {
                // LoginRequest는 { "email": "...", "password": "..." } DTO
                LoginRequest creds = objectMapper.readValue(is, LoginRequest.class);

                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        creds.getEmail(),
                        creds.getPassword(),
                        Collections.emptyList()
                    );
                setDetails(request, authToken);
                return this.getAuthenticationManager().authenticate(authToken);

            } catch (IOException e) {
                throw new AuthenticationServiceException("Failed to parse JSON request", e);
            }
        }

        // JSON이 아니면 기본 폼 처리로 포워드
        return super.attemptAuthentication(request, response);
    }
}
