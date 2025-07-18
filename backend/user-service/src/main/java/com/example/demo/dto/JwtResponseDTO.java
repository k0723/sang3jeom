package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * JWT 응답 DTO
 */
@Data
@NoArgsConstructor       // 파라미터 없는 생성자 자동 생성
@AllArgsConstructor      // 모든 필드를 인자로 받는 생성자 자동 생성
@Builder 
public class JwtResponseDTO {
    private String accessToken;
    private long accessExpiresIn;
    private String refreshToken;
    private long refreshExpiresIn;

    public JwtResponseDTO(String accessToken, long accessExpiresIn) {
        this.accessToken = accessToken;
        this.accessExpiresIn = accessExpiresIn;
    }

}
