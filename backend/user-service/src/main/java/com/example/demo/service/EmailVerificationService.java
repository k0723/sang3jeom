package com.example.demo.service;

import com.example.demo.domain.EmailVerification;
import com.example.demo.dto.EmailVerificationConfirmRequest;
import com.example.demo.dto.EmailVerificationRequest;
import com.example.demo.dto.EmailVerificationResponse;
import com.example.demo.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {
    
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;
    private final Random random = new Random();
    
    /**
     * 이메일 인증 코드 전송
     */
    public EmailVerificationResponse sendVerificationCode(EmailVerificationRequest request) {
        String email = request.getEmail();
        
        try {
            // 기존 인증 정보가 있으면 삭제
            emailVerificationRepository.findByEmail(email)
                    .ifPresent(emailVerificationRepository::delete);
            
            // 새로운 인증 코드 생성
            String verificationCode = generateVerificationCode();
            
            // 인증 정보 저장
            EmailVerification emailVerification = EmailVerification.builder()
                    .email(email)
                    .verificationCode(verificationCode)
                    .build();
            
            emailVerificationRepository.save(emailVerification);
            
            // 이메일 전송
            emailService.sendVerificationEmail(email, verificationCode);
            
            log.info("인증 코드 전송 완료: {}", email);
            return EmailVerificationResponse.success("인증 코드가 이메일로 전송되었습니다.", email);
            
        } catch (Exception e) {
            log.error("인증 코드 전송 실패: {}", email, e);
            return EmailVerificationResponse.failure("인증 코드 전송에 실패했습니다.");
        }
    }
    
    /**
     * 이메일 인증 코드 확인
     */
    public EmailVerificationResponse confirmVerificationCode(EmailVerificationConfirmRequest request) {
        String email = request.getEmail();
        String verificationCode = request.getVerificationCode();
        
        try {
            Optional<EmailVerification> verificationOpt = emailVerificationRepository
                    .findByEmailAndVerificationCode(email, verificationCode);
            
            if (verificationOpt.isEmpty()) {
                return EmailVerificationResponse.failure("인증 코드가 일치하지 않습니다.");
            }
            
            EmailVerification verification = verificationOpt.get();
            
            // 시도 횟수 확인
            if (!verification.canAttempt()) {
                return EmailVerificationResponse.failure("인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요.");
            }
            
            // 만료 확인
            if (verification.isExpired()) {
                return EmailVerificationResponse.failure("인증 코드가 만료되었습니다. 새로운 인증 코드를 요청해주세요.");
            }
            
            // 인증 성공 처리
            verification.setVerified(true);
            emailVerificationRepository.save(verification);
            
            log.info("이메일 인증 완료: {}", email);
            return EmailVerificationResponse.success("이메일 인증이 완료되었습니다.", email);
            
        } catch (Exception e) {
            log.error("인증 코드 확인 실패: {}", email, e);
            return EmailVerificationResponse.failure("인증 처리 중 오류가 발생했습니다.");
        }
    }
    
    /**
     * 이메일 인증 상태 확인
     */
    public boolean isEmailVerified(String email) {
        return emailVerificationRepository.existsByEmailAndVerifiedTrue(email);
    }
    
    /**
     * 인증 코드 재전송
     */
    public EmailVerificationResponse resendVerificationCode(EmailVerificationRequest request) {
        String email = request.getEmail();
        
        try {
            // 기존 인증 정보 확인
            Optional<EmailVerification> existingVerification = emailVerificationRepository.findByEmail(email);
            
            if (existingVerification.isPresent()) {
                EmailVerification verification = existingVerification.get();
                
                // 이미 인증된 경우
                if (verification.isVerified()) {
                    return EmailVerificationResponse.failure("이미 인증된 이메일입니다.");
                }
                
                // 새로운 인증 코드 생성
                String newVerificationCode = generateVerificationCode();
                verification.setVerificationCode(newVerificationCode);
                verification.setAttemptCount(0);
                emailVerificationRepository.save(verification);
                
                // 이메일 재전송
                emailService.sendVerificationEmail(email, newVerificationCode);
                
                log.info("인증 코드 재전송 완료: {}", email);
                return EmailVerificationResponse.success("인증 코드가 재전송되었습니다.", email);
            } else {
                return EmailVerificationResponse.failure("인증 요청이 없습니다. 먼저 인증 코드를 요청해주세요.");
            }
            
        } catch (Exception e) {
            log.error("인증 코드 재전송 실패: {}", email, e);
            return EmailVerificationResponse.failure("인증 코드 재전송에 실패했습니다.");
        }
    }
    
    /**
     * 6자리 랜덤 인증 코드 생성
     */
    private String generateVerificationCode() {
        return String.format("%06d", random.nextInt(1000000));
    }
    
    /**
     * 만료된 인증 정보 정리 (매일 자정 실행)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupExpiredVerifications() {
        try {
            emailVerificationRepository.deleteExpiredVerifications(LocalDateTime.now());
            log.info("만료된 이메일 인증 정보 정리 완료");
        } catch (Exception e) {
            log.error("만료된 이메일 인증 정보 정리 실패", e);
        }
    }
} 