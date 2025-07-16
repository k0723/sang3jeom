package com.example.demo.security.filter;

import com.example.demo.dto.LoginRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

/**
 * JSON 바디로 로그인 요청을 받을 수 있도록 UsernamePasswordAuthenticationFilter를 확장.
 */
@RequiredArgsConstructor
public class JsonUsernamePasswordAuthenticationFilter
        extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper objectMapper;   // Jackson ObjectMapper는 스프링 빈으로 주입

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {

        // JSON 요청인지 검사
        String contentType = request.getContentType();
        if (contentType != null && contentType.startsWith(MediaType.APPLICATION_JSON_VALUE)) {
            try (ServletInputStream is = request.getInputStream()) {
                LoginRequestDTO creds = objectMapper.readValue(is, LoginRequestDTO.class);

                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        creds.getEmail(),
                        creds.getPassword(),
                        Collections.emptyList()
                    );
                setDetails(request, authToken);
                return this.getAuthenticationManager().authenticate(authToken);

            } catch (IOException e) {
                throw new AuthenticationServiceException("JSON 파싱에 실패했습니다", e);
            }
        }

        // JSON이 아니면 기본 form 로그인 처리로 위임
        return super.attemptAuthentication(request, response);
    }
}
