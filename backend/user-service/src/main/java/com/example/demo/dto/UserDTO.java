package com.example.demo.dto;

import com.example.demo.domain.UserEntity;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter        // ← 필드별로 getter를 자동 생성
@Setter 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String passwordHash;
    private String name;

    private String phone;

    private String profileImageUrl;
    private LocalDateTime createdAt;

    /**
     * Entity → DTO 변환
     */
    public static UserDTO fromEntity(UserEntity u) {
        return UserDTO.builder()
                      .id(u.getId())
                      .email(u.getEmail())
                      .passwordHash(u.getPasswordHash())
                      .name(u.getName())
                      .profileImageUrl(u.getProfileImageUrl())
                      .createdAt(u.getCreatedAt())
                      .build();
    }

    /**
     * OAuth2 전용 일부 매핑: nickname만 세팅
     */
    public static UserDTO fromOAuth2(UserEntity u) {
        return UserDTO.builder()
                      .id(u.getId())
                      .email(u.getEmail())
                      .name(u.getName())
                      .build();
    }

    public UserEntity toEntity() {
        return UserEntity.builder()
                         .id(this.id)                    // 업데이트용: id가 null이면 새 생성
                         .email(this.email)
                         .passwordHash(this.passwordHash)
                         .name(this.name)
                         .profileImageUrl(this.profileImageUrl)
                         .roles(false)                   // 기본 ROLE 설정
                         .createdAt(this.createdAt)      // 새로 생성할 때는 null 처리하거나 JPA 기본값 사용
                         .build();
    }



}
