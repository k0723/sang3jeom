package com.sang3jeom.order_service.controller;

import com.sang3jeom.order_service.dto.CreateOrderRequest;
import com.sang3jeom.order_service.dto.CreateOrderResponse;
import com.sang3jeom.order_service.dto.CartOrderRequest;
import com.sang3jeom.order_service.dto.DirectOrderRequest;
import com.sang3jeom.order_service.dto.OrderStatsResponse;
import com.sang3jeom.order_service.service.OrderService;
import com.sang3jeom.order_service.config.UserServiceClient;
import com.sang3jeom.order_service.dto.UserInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.sang3jeom.order_service.domain.Order;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserServiceClient userServiceClient;

/*    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(
                orderService.createOrder(request));
    }

    @PostMapping("/cart")
    public ResponseEntity<CreateOrderResponse> orderFromCart(@RequestBody CartOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromCart(request));
    }*/

    @PostMapping("/direct")
    public ResponseEntity<CreateOrderResponse> directOrder(
            @RequestBody DirectOrderRequest request,
            @RequestHeader("Authorization") String authorizationHeader // 토큰 받기
    ) {
        // 디버깅을 위한 로그 추가
        System.out.println("[OrderController] DirectOrderRequest 받은 값들:");
        System.out.println("  goodsId: " + request.getGoodsId());
        System.out.println("  goodsName: " + request.getGoodsName());
        System.out.println("  quantity: " + request.getQuantity());
        System.out.println("  price: " + request.getPrice());
        System.out.println("  address: " + request.getAddress());
        System.out.println("  memo: " + request.getMemo());
        
        return ResponseEntity.ok(orderService.createDirectOrder(request, authorizationHeader));
    }

    // 유저의 주문내역 조회 API
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[OrderController] 주문내역 조회 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("주문내역 조회 유저 ID: " + userInfo.getUserId());
        System.out.println("주문내역 조회 유저 이름: " + userInfo.getName());
        
        List<Order> orders = orderService.getOrdersByUserId(userInfo.getUserId().longValue());
        return ResponseEntity.ok(orders);
    }

    // 유저의 주문 통계 조회 API
    @GetMapping("/my-stats")
    public ResponseEntity<OrderStatsResponse> getMyOrderStats(
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[OrderController] 주문 통계 조회 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("주문 통계 조회 유저 ID: " + userInfo.getUserId());
        
        OrderStatsResponse stats = orderService.getOrderStatsByUserId(userInfo.getUserId().longValue());
        return ResponseEntity.ok(stats);
    }
}
