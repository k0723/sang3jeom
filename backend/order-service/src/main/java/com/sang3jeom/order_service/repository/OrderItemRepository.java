package com.sang3jeom.order_service.repository;

import com.sang3jeom.order_service.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {}
