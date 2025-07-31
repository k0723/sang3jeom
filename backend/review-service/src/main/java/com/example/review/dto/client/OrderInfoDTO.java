package com.example.review.dto.client;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderInfoDTO {
    private Long orderId;
    private Long userId;
    private String orderNumber;
    private String status;
    private Integer totalAmount;
    private LocalDateTime orderDate;
    private List<OrderItemDTO> items;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long goodsId;
        private String goodsName;
        private String imageUrl;
        private Integer quantity;
        private Integer price;
    }
}
