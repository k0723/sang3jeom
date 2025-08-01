package com.example.review.client;

import com.example.review.dto.client.OrderInfoDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@Slf4j
public class OrderServiceClientFallback implements OrderServiceClient {

    @Override
    public OrderInfoDTO getOrderById(Long orderId) {
        log.error("🚨 Order Service 호출 실패 - Fallback 실행 | orderId: {}", orderId);
        return new OrderInfoDTO(
            orderId, 
            null, 
            "주문 정보를 불러올 수 없습니다", 
            "UNKNOWN", 
            0, 
            null, 
            Collections.emptyList()
        );
    }

    @Override
    public List<OrderInfoDTO> getOrdersByIds(List<Long> orderIds) {
        log.error("🚨 Order Service Batch 호출 실패 - Fallback 실행 | orderIds: {}", orderIds);
        return Collections.emptyList();
    }
}
