package com.sang3jeom.order_service.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer userId;

    private String status;

    private LocalDateTime orderDate;

    private String address;

    private String memo;

    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
    }
}
