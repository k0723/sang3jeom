package com.example.demo.dto;

import com.example.demo.domain.User;
import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String email;
    private String passwordHash;
    private String nickname;
    private String profileImageUrl;
    private LocalDateTime createdAt;

    // 기본 생성자
    public UserDto() {}

    // 전체 필드 생성자 (필요 시)
    public UserDto(Long id, String email, String passwordHash,
                   String nickname, String profileImageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
    }

    // Entity → DTO 변환
    public static UserDto fromEntity(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setPasswordHash(u.getPasswordHash());
        dto.setNickname(u.getNickname());
        dto.setProfileImageUrl(u.getProfileImageUrl());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

    // OAuth2 전용 일부 매핑: nickname만 세팅
    public static UserDto fromOAuth2(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setNickname(u.getNickname());
        return dto;
    }

    // --- getter / setter ---
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getNickname() {
        return nickname;
    }
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
