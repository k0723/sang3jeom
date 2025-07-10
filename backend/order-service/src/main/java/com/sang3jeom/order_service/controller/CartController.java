package com.sang3jeom.order_service.controller;

import com.sang3jeom.order_service.model.Cart;
import com.sang3jeom.order_service.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addCart(@RequestBody Map<String, Object> payload) {
        // 실제론 authorization에서 userId 추출하는 로직 필요 (토큰 파싱 등)
        // 여기선 편의상 userId 하드코딩 또는 payload에 포함시켜도 됨
        int userId = 1;  // TODO: 토큰 파싱 후 실제 유저 ID 넣기
        int goodsId = (int) payload.get("goodsId");
        int quantity = (int) payload.get("quantity");

        Cart savedCart = cartService.addToCart(userId, goodsId, quantity);

        return ResponseEntity.ok(Map.of(
                "cartId", savedCart.getId(),
                "addedAt", savedCart.getAddedAt().toString()
        ));
    }
}