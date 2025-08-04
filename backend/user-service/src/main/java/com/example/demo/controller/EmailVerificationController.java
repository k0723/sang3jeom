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
@RequestMapping("/users/email-verification")
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

        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/confirm")
    @Operation(summary = "이메일 인증 코드 확인", description = "전송된 인증 코드를 확인하여 이메일 인증을 완료합니다.")
    public ResponseEntity<EmailVerificationResponse> confirmVerificationCode(
            @Valid @RequestBody EmailVerificationConfirmRequest request) {

        log.info("이메일 인증 코드 확인 요청: {}", request.getEmail());

        boolean verified = emailVerificationService.verifyCode(
                request.getEmail(), request.getVerificationCode()
        );

        EmailVerificationResponse response = verified
                ? EmailVerificationResponse.success("이메일 인증이 완료되었습니다.", request.getEmail())
                : EmailVerificationResponse.failure("인증 코드가 올바르지 않거나 만료되었습니다.");

        return verified ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/resend")
    @Operation(summary = "이메일 인증 코드 재전송", description = "인증 코드를 재전송합니다.")
    public ResponseEntity<EmailVerificationResponse> resendVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {

        log.info("이메일 인증 코드 재전송 요청: {}", request.getEmail());

        EmailVerificationResponse response = emailVerificationService.resendVerificationCode(request);

        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Redis-only 구조에서는 인증 성공 시 키를 삭제하므로
     * 상태 조회는 '남은 인증 코드 여부'를 기준으로 반환합니다.
     */
    @GetMapping("/status/{email}")
    @Operation(summary = "이메일 인증 상태 확인", description = "Redis 기반 인증 상태를 확인합니다. (코드 미존재 = 인증 완료)")
    public ResponseEntity<EmailVerificationResponse> checkVerificationStatus(@PathVariable String email) {

        log.info("이메일 인증 상태 확인 요청: {}", email);

        boolean isPending = emailVerificationService.hasPendingVerification(email);

        EmailVerificationResponse response = isPending
                ? EmailVerificationResponse.failure("인증이 아직 완료되지 않았습니다.")
                : EmailVerificationResponse.success("이메일 인증 완료 상태입니다.", email);

        return ResponseEntity.ok(response);
    }
}
