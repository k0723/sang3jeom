package com.sang3jeom.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CreateOrderResponse {
    private Integer orderId;
    private String status;
    private LocalDateTime orderedAt;
}