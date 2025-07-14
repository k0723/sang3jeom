package com.sang3jeom.order_service.controller;

import com.sang3jeom.order_service.dto.CreateOrderRequest;
import com.sang3jeom.order_service.dto.CreateOrderResponse;
import com.sang3jeom.order_service.dto.CartOrderRequest;
import com.sang3jeom.order_service.dto.DirectOrderRequest;
import com.sang3jeom.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PostMapping("/cart")
    public ResponseEntity<CreateOrderResponse> orderFromCart(@RequestBody CartOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromCart(request));
    }

    @PostMapping("/direct")
    public ResponseEntity<CreateOrderResponse> directOrder(@RequestBody DirectOrderRequest request) {
        return ResponseEntity.ok(orderService.createDirectOrder(request));
    }
}
