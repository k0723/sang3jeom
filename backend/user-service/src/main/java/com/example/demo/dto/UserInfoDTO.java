package com.example.demo.dto;

import com.example.demo.domain.UserEntity;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfoDTO {
    private Long id;
    private String username;          // ✅ gRPC 응답용
    private String role;              // ✅ gRPC 응답용
    private String email;
    private String name;
    private String phone;
    private String profileImageUrl;
    private LocalDateTime createdAt;

    public static UserInfoDTO userInfo(UserEntity u) {
        return UserInfoDTO.builder()
                         .id(u.getId())
                         .username(u.getUsername())        // ✅ 추가
                         .role(u.isRoles() ? "ADMIN" : "USER")         // ✅ Enum → String
                         .email(u.getEmail())
                         .name(u.getName())
                         .phone(u.getPhone())
                         .profileImageUrl(u.getProfileImageUrl())
                         .createdAt(u.getCreatedAt())
                         .build();
    }
}
