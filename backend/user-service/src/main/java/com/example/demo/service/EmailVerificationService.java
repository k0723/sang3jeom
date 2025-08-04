package com.example.demo.service;

import com.example.demo.domain.EmailVerification;
import com.example.demo.dto.EmailVerificationConfirmRequest;
import com.example.demo.dto.EmailVerificationRequest;
import com.example.demo.dto.EmailVerificationResponse;
import com.example.demo.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;
    private final Random random = new Random();

    private static final Duration VERIFICATION_TTL = Duration.ofMinutes(5);
    
    /**
     * 이메일 인증 코드 전송
     */
    public EmailVerificationResponse sendVerificationCode(EmailVerificationRequest request) {
        String email = request.getEmail();
        try {
            // 1. 인증 코드 생성
            String verificationCode = generateVerificationCode();

            // 2. Redis에 5분 TTL로 저장
            String redisKey = buildRedisKey(email);
            redisTemplate.opsForValue().set(redisKey, verificationCode, VERIFICATION_TTL);

            // 3. 이메일 발송
            emailService.sendVerificationEmail(email, verificationCode);

            log.info("인증 코드 전송 완료 (Redis 저장): {}", email);
            return EmailVerificationResponse.success("인증 코드가 이메일로 전송되었습니다.", email);

        } catch (Exception e) {
            log.error("인증 코드 전송 실패: {}", email, e);
            return EmailVerificationResponse.failure("인증 코드 전송에 실패했습니다.");
        }
    }
    
    /**
     * 이메일 인증 코드 확인
     */
    public boolean verifyCode(String email, String inputCode) {
        String redisKey = buildRedisKey(email);
        String savedCode = redisTemplate.opsForValue().get(redisKey);

        if (savedCode != null && savedCode.equals(inputCode)) {
            // 인증 성공 시 Redis 키 삭제
            redisTemplate.delete(redisKey);
            log.info("이메일 인증 성공 및 Redis 키 삭제: {}", email);
            return true;
        }

        log.warn("이메일 인증 실패 - 코드 불일치 또는 만료됨: {}", email);
        return false;
    }
    
    /**
     * 이메일 인증 상태 확인
     */
    public EmailVerificationResponse resendVerificationCode(EmailVerificationRequest request) {
        String email = request.getEmail();
        try {
            // 1. 새 코드 생성
            String newVerificationCode = generateVerificationCode();

            // 2. 기존 키 덮어쓰기 (TTL 갱신)
            String redisKey = buildRedisKey(email);
            redisTemplate.opsForValue().set(redisKey, newVerificationCode, VERIFICATION_TTL);

            // 3. 이메일 발송
            emailService.sendVerificationEmail(email, newVerificationCode);

            log.info("인증 코드 재전송 완료 (Redis 덮어쓰기): {}", email);
            return EmailVerificationResponse.success("인증 코드가 재전송되었습니다.", email);

        } catch (Exception e) {
            log.error("인증 코드 재전송 실패: {}", email, e);
            return EmailVerificationResponse.failure("인증 코드 재전송에 실패했습니다.");
        }
    }
    

    private String buildRedisKey(String email) {
        return "email:verification:" + email;
    }
    /**
     * 6자리 랜덤 인증 코드 생성
     */
    private String generateVerificationCode() {
        return String.format("%06d", random.nextInt(1000000));
    }

        /** 
     * Redis에 인증 대기 키 존재 여부 확인 
     */
    public boolean hasPendingVerification(String email) {
        String redisKey = buildRedisKey(email);
        return Boolean.TRUE.equals(redisTemplate.hasKey(redisKey));
    }

    
} 