package com.sang3jeom.order_service.repository;

import com.sang3jeom.order_service.domain.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    // 필요하면 커스텀 쿼리 추가 가능
}