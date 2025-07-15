package com.example.demo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;            
import lombok.Setter;            
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder; 

@Entity
@Table(name = "Users")
@Getter
@Setter
@Builder
@NoArgsConstructor  
@AllArgsConstructor 
public class UserEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 식별자
    @Column(nullable = false, unique = true)
    private String username;

    // 이메일 (추가 정보)
    @Column(nullable = false, unique = true)
    private String email;

    // (OAuth2 토큰 혹은 패스워드 해시)
    @Column(nullable = true)
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
}
