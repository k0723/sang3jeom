package com.sang3jeom.order_service.service;

import com.sang3jeom.order_service.dto.CreateOrderRequest;
import com.sang3jeom.order_service.dto.CreateOrderResponse;
import com.sang3jeom.order_service.model.Cart;
import com.sang3jeom.order_service.model.Order;
import com.sang3jeom.order_service.model.OrderItem;
import com.sang3jeom.order_service.repository.CartRepository;
import com.sang3jeom.order_service.repository.OrderItemRepository;
import com.sang3jeom.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        Order order = new Order();
        order.setUserId(cart.getUserId());
        order.setStatus("PENDING");
        orderRepository.save(order);

        OrderItem item = new OrderItem();
        item.setOrderId(order.getId());
        item.setGoodsId(cart.getGoodsId());
        item.setQuantity(cart.getQuantity());
        orderItemRepository.save(item);

        return new CreateOrderResponse(order.getId(), order.getStatus(), order.getOrderDate());
    }
}