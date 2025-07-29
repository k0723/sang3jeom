package com.sang3jeom.order_service.repository;

import com.sang3jeom.order_service.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    // 유저 ID로 주문내역 조회 (최신순)
    List<Order> findByUserIdOrderByOrderDateDesc(Integer userId);
}
