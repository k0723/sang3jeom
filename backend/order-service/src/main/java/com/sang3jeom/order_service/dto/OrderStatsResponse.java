package com.sang3jeom.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsResponse {
    private int totalOrders;
    private int totalSpent;
} 