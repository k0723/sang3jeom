package com.sang3jeom.order_service.repository;

import com.sang3jeom.order_service.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {}
