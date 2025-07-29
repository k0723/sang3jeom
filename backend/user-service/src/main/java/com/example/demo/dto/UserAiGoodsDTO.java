package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAiGoodsDTO {
    private Long id;
    private String goodsType;
    private String imageUrl;
    private LocalDateTime createdAt;
    private Long userId;
    private String userName;
} 