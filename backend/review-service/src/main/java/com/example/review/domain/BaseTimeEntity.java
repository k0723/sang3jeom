package com.example.review.domain;

import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass // JPA Entity 클래스들이 BaseTimeEntity를 상속할 경우 필드들도 칼럼으로 인식하도록 합니다.
@EntityListeners(AuditingEntityListener.class) // Auditing 기능을 포함시킵니다.
public abstract class BaseTimeEntity {

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
