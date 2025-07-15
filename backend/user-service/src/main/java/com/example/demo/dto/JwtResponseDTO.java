package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * JWT 응답 DTO
 */
@Data
@NoArgsConstructor       // 파라미터 없는 생성자 자동 생성
@AllArgsConstructor      // 모든 필드를 인자로 받는 생성자 자동 생성
public class JwtResponseDTO {
    private String token;
    private long expiresIn;
}
