package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailRequest {
    /** 수신자 이메일 */
    private String to;

    /** 메일 제목 */
    private String subject;

    /** 메일 본문 (텍스트) */
    private String text;
}
