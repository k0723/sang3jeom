package com.example.demo.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;


import java.io.IOException;

@RestController
public class SocialLoginController {

    /**
     * 프론트엔드에서 이 API를 호출하면
     * 바로 Spring Security의 OAuth2 인가 시작 URL로 Redirect 됩니다.
     */
}
