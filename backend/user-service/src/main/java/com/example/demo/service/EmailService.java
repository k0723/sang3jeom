package com.example.demo.service;

import com.example.demo.dto.EmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.email.verification.subject:이메일 인증 코드}")
    private String subject;
    
    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(createEmailContent(verificationCode));
            
            mailSender.send(message);
            log.info("인증 이메일 전송 완료: {}", toEmail);
        } catch (Exception e) {
            log.error("인증 이메일 전송 실패: {}", toEmail, e);
            throw new RuntimeException("이메일 전송에 실패했습니다.", e);
        }
    }
    
    private String createEmailContent(String verificationCode) {
        return String.format("""
            상삼점(상점) 이메일 인증
            
            안녕하세요!
            
            회원가입을 위한 이메일 인증 코드입니다.
            
            인증 코드: %s
            
            이 코드는 10분간 유효합니다.
            인증 코드를 입력하여 이메일 인증을 완료해주세요.
            
            감사합니다.
            상삼점(상점) 팀
            """, verificationCode);
    }

    public EmailResponse sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("단순 텍스트 메일 발송 완료: {}", to);
            return new EmailResponse(true,"메일 발송 성공: " + to);
        } catch (Exception e) {
            log.error("단순 텍스트 메일 발송 실패: {}", to, e);
            throw new RuntimeException("메일 전송 실패", e);
        }
    }

} 