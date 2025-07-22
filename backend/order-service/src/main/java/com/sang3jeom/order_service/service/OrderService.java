package com.sang3jeom.order_service.service;

import com.sang3jeom.order_service.dto.CreateOrderRequest;
import com.sang3jeom.order_service.dto.CreateOrderResponse;
import com.sang3jeom.order_service.dto.DirectOrderRequest;
import com.sang3jeom.order_service.domain.Order;
import com.sang3jeom.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
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
    public CreateOrderResponse createDirectOrder(DirectOrderRequest request) {
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setStatus("PENDING");
        order.setAddress(request.getAddress());
        order.setMemo(request.getMemo());
        order.setUserName(request.getUserName());
        order.setPrice(request.getPrice());
        order.setQuantity(request.getQuantity());
        orderRepository.save(order);

//        OrderItem item = new OrderItem();
//        item.setOrderId(order.getId());
//        item.setGoodsId(request.getGoodsId());
//        item.setStatus("PENDING");
//        item.setQuantity(request.getQuantity());
//        orderItemRepository.save(item);

        return new CreateOrderResponse(order.getId(), order.getStatus(), order.getOrderDate(), order.getQuantity(), order.getUserName(), order.getPrice());
    }
}