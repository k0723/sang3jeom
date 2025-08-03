package com.example.demo.controller;

import com.example.demo.dto.EmailVerificationConfirmRequest;
import com.example.demo.dto.EmailVerificationRequest;
import com.example.demo.dto.EmailVerificationResponse;
import com.example.demo.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/email-verification")
@RequiredArgsConstructor
@Tag(name = "Email Verification", description = "이메일 인증 API")
public class EmailVerificationController {
    
    private final EmailVerificationService emailVerificationService;
    
    @PostMapping("/send")
    @Operation(summary = "이메일 인증 코드 전송", description = "회원가입 시 이메일 인증 코드를 전송합니다.")
    public ResponseEntity<EmailVerificationResponse> sendVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {
        
        log.info("이메일 인증 코드 전송 요청: {}", request.getEmail());
        
        EmailVerificationResponse response = emailVerificationService.sendVerificationCode(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/confirm")
    @Operation(summary = "이메일 인증 코드 확인", description = "전송된 인증 코드를 확인하여 이메일 인증을 완료합니다.")
    public ResponseEntity<EmailVerificationResponse> confirmVerificationCode(
            @Valid @RequestBody EmailVerificationConfirmRequest request) {
        
        log.info("이메일 인증 코드 확인 요청: {}", request.getEmail());
        
        EmailVerificationResponse response = emailVerificationService.confirmVerificationCode(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/resend")
    @Operation(summary = "이메일 인증 코드 재전송", description = "인증 코드를 재전송합니다.")
    public ResponseEntity<EmailVerificationResponse> resendVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {
        
        log.info("이메일 인증 코드 재전송 요청: {}", request.getEmail());
        
        EmailVerificationResponse response = emailVerificationService.resendVerificationCode(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/status/{email}")
    @Operation(summary = "이메일 인증 상태 확인", description = "이메일의 인증 상태를 확인합니다.")
    public ResponseEntity<EmailVerificationResponse> checkVerificationStatus(@PathVariable String email) {
        
        log.info("이메일 인증 상태 확인 요청: {}", email);
        
        boolean isVerified = emailVerificationService.isEmailVerified(email);
        
        EmailVerificationResponse response = isVerified 
                ? EmailVerificationResponse.success("이메일이 인증되었습니다.", email)
                : EmailVerificationResponse.failure("이메일이 인증되지 않았습니다.");
        
        return ResponseEntity.ok(response);
    }
} 