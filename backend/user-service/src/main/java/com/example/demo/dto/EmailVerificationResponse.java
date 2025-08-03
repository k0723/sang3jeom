package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationResponse {
    
    private boolean success;
    private String message;
    private String email;
    private boolean verified;
    
    public static EmailVerificationResponse success(String message, String email) {
        return EmailVerificationResponse.builder()
                .success(true)
                .message(message)
                .email(email)
                .verified(true)
                .build();
    }
    
    public static EmailVerificationResponse failure(String message) {
        return EmailVerificationResponse.builder()
                .success(false)
                .message(message)
                .verified(false)
                .build();
    }
} 