package com.example.review.client;

import com.example.review.dto.client.OrderInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
    name = "order-service", 
    url = "${service-urls.order-service}",
    fallback = OrderServiceClientFallback.class
)
public interface OrderServiceClient {

    /**
     * 특정 주문 정보 조회
     * @param orderId 주문 ID
     * @return 주문 정보 DTO
     */
    @GetMapping("/api/orders/{orderId}")
    OrderInfoDTO getOrderById(@PathVariable("orderId") Long orderId);

    /**
     * 여러 주문 정보 batch 조회
     * @param orderIds 주문 ID 목록
     * @return 주문 정보 목록
     */
    @GetMapping("/api/orders/batch")
    List<OrderInfoDTO> getOrdersByIds(@RequestParam("orderIds") List<Long> orderIds);
}
