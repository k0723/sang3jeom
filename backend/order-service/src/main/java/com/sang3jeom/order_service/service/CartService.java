package com.sang3jeom.order_service.service;

import com.sang3jeom.order_service.domain.Cart;
import com.sang3jeom.order_service.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public Cart addToCart(int userId, int goodsId, int quantity) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setGoodsId(goodsId);
        cart.setQuantity(quantity);
        return cartRepository.save(cart);
    }

    public java.util.List<Cart> getCartItemsByUserId(int userId) {
        return cartRepository.findAll().stream()
            .filter(cart -> cart.getUserId() == userId)
            .toList();
    }
}
