package com.example.demo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "user_ai_goods")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAiGoodsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String goodsType; // ex) mug, tshirt, ecobag, case

    @Column(nullable = false)
    private String imageUrl; // 합성된 굿즈 이미지 S3 URL

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
} 