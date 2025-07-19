package com.sang3jeom.order_service.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cart_items")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private int userId;

    private int goodsId;

    private int quantity;

    private ZonedDateTime addedAt;

    @PrePersist
    public void prePersist() {
        this.addedAt = ZonedDateTime.now();
    }
}