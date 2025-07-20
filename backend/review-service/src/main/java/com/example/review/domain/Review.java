package com.example.review.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseTimeEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private Double rating; // 1.0 ~ 5.0

    @Column(nullable = false)
    private Long userId;

    @Builder
    public Review(String content, Double rating, Long userId) {
        this.content = content;
        this.rating = rating;
        this.userId = userId;
    }

    public void update(String content, Double rating) {
        this.content = content;
        this.rating = rating;
    }
}