package com.example.demo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "user_ai_image")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAiImageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String imageUrl;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
} 