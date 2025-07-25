package com.example.review.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfoDTO {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String profileImageUrl;
    private LocalDateTime createdAt;
}
