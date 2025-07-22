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

    // 추가: 주문자 이름, 가격, 수량
    private String userName;   // 주문자 이름
    private long price;        // 가격
    private int quantity;      // 수량

    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
    }
}
