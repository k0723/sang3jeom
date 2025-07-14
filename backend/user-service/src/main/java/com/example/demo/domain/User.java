package com.example.demo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 식별자
    @Column(nullable = false, unique = true)
    private String username;

    // 이메일 (추가 정보)
    @Column(nullable = false, unique = true)
    private String email;

    // (OAuth2 토큰 혹은 패스워드 해시)
    @Column(nullable = false)
    private String passwordHash;

    // 관리자 여부
    @Column(nullable = false)
    private boolean roles;

    // 프로필 이름 (OAuth2 name 또는 닉네임)
    private String name;

    // 프로필 이미지
    private String profileImageUrl;

    // 가입일시
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    //--- 생성자 ---
    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(Long id, String username, String email, String passwordHash, boolean roles,
                String name, String profileImageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
    }

    //--- getters & setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    /** alias for security */
    public String getPassword() { return passwordHash; }
    public void setPassword(String rawOrHash) { this.passwordHash = rawOrHash; }

    public boolean isRoles() { return roles; }
    public void setRoles(boolean roles) { this.roles = roles; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // alias for nickname
    public String getNickname() { return name; }
    public void setNickname(String nickname) { this.name = nickname; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
