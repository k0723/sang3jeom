package com.example.demo.controller;

import com.example.demo.dto.EmailRequest;
import com.example.demo.dto.EmailResponse;
import com.example.demo.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    /**
     * 단순 텍스트 이메일 발송
     */
    @PostMapping("/send")
    public ResponseEntity<EmailResponse> sendEmail(@RequestBody EmailRequest request) {
        log.info("이메일 발송 요청: {}", request.getTo());
        EmailResponse response = emailService.sendSimpleEmail(
            request.getTo(),
            request.getSubject(),
            request.getText()
        );
        return ResponseEntity.ok(response);
    }

}
