package com.sang3jeom.order_service.service;

import com.sang3jeom.order_service.config.UserServiceClient;
import com.sang3jeom.order_service.dto.CreateOrderRequest;
import com.sang3jeom.order_service.dto.CreateOrderResponse;
import com.sang3jeom.order_service.dto.DirectOrderRequest;
import com.sang3jeom.order_service.dto.OrderStatsResponse;
import com.sang3jeom.order_service.domain.Order;
import com.sang3jeom.order_service.dto.UserInfoDTO;
import com.sang3jeom.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserServiceClient userServiceClient;
//
/*

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setStatus("PENDING");
        order.setAddress(request.getAddress());
        order.setMemo(request.getMemo());
        order.setUserName(request.getUserName());
        order.setPrice(request.getPrice());
        order.setQuantity(request.getQuantity());

        if (request.getCartId() != null) {
            // 장바구니 기반 주문
            Cart cart = cartRepository.findById(request.getCartId())
                    .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
            order.setUserId(cart.getUserId());  //추후 토큰에서 값 추출
            // userName, price, quantity도 cart에서 추출해 세팅 (cart에 필드가 있다면)
            order.setUserName(request.getUserName());
            order.setPrice(request.getPrice());
            order.setQuantity(cart.getQuantity());
            orderRepository.save(order);

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setGoodsId(cart.getGoodsId());
            item.setStatus(order.getStatus());
            item.setQuantity(cart.getQuantity());
            orderItemRepository.save(item);
        } else if (request.getGoodsId() != null && request.getQuantity() > 0  && request.getUserId() != null) {
            // 즉시구매(바로 주문)
            order.setUserId(request.getUserId());   //추후 토큰에서 값 추출
            order.setUserName(request.getUserName());
            order.setPrice(request.getPrice());
            order.setQuantity(request.getQuantity());
            orderRepository.save(order);

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setGoodsId(request.getGoodsId());
            item.setStatus(order.getStatus());
            item.setQuantity(request.getQuantity());
            orderItemRepository.save(item);
        } else {
            throw new IllegalArgumentException("주문 정보가 부족합니다.");
        }

        return new CreateOrderResponse(order.getId(), order.getStatus(), order.getOrderDate(), order.getQuantity(), order.getUserName(), order.getPrice());
    }*/


    @Transactional
    public CreateOrderResponse createDirectOrder(DirectOrderRequest request, String token) {
        System.out.println("[OrderService] 전달받은 Authorization 헤더: " + token);

        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("userInfo.getUserId(): " + userInfo.getUserId());
        System.out.println("userInfo.getName(): " + userInfo.getName());

        // 디버깅을 위한 로그 추가
        System.out.println("[OrderService] DirectOrderRequest 값들:");
        System.out.println("  goodsId: " + request.getGoodsId());
        System.out.println("  goodsName: " + request.getGoodsName());
        System.out.println("  quantity: " + request.getQuantity());
        System.out.println("  price: " + request.getPrice());
        System.out.println("  address: " + request.getAddress());
        System.out.println("  memo: " + request.getMemo());

        Order order = new Order();
        order.setUserId(userInfo.getUserId());
        order.setUserName(userInfo.getName());
        order.setStatus("COMPLETED"); // PENDING에서 COMPLETED로 변경
        order.setAddress(request.getAddress());
        order.setMemo(request.getMemo());
        order.setPrice(request.getPrice());
        order.setQuantity(request.getQuantity());
        order.setGoodsId(request.getGoodsId());
        order.setGoodsName(request.getGoodsName());
        
        // 저장 전 로그
        System.out.println("[OrderService] 저장 전 Order 엔티티:");
        System.out.println("  goodsId: " + order.getGoodsId());
        System.out.println("  goodsName: " + order.getGoodsName());
        
        orderRepository.save(order);
        
        // 저장 후 로그
        System.out.println("[OrderService] 저장 후 Order 엔티티:");
        System.out.println("  goodsId: " + order.getGoodsId());
        System.out.println("  goodsName: " + order.getGoodsName());

        return new CreateOrderResponse(order.getId(), order.getStatus(), order.getOrderDate(), order.getQuantity(), order.getUserName(), order.getPrice(), order.getMemo());
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId.intValue());
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse getOrderStatsByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId.intValue());
        
        int totalOrders = orders.size();
        int totalSpent = orders.stream()
                .mapToInt(order -> (int) order.getPrice())
                .sum();
        
        return new OrderStatsResponse(totalOrders, totalSpent);
    }
}