package com.example.demo.controller;

import com.example.demo.domain.UserAiGoodsEntity;
import com.example.demo.service.UserAiGoodsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/user-goods")
@RequiredArgsConstructor
public class UserAiGoodsController {
    private final UserAiGoodsService aiGoodsService;

    // 굿즈 이미지 저장 (멀티파트)
    @PostMapping
    public UserAiGoodsEntity saveGoods(
            @RequestParam Long userId,
            @RequestParam String goodsType,
            @RequestParam MultipartFile file
    ) throws Exception {
        return aiGoodsService.saveAiGoods(userId, goodsType, file);
    }

    // 유저별 전체 굿즈 조회
    @GetMapping
    public List<UserAiGoodsEntity> getUserGoods(@RequestParam Long userId) {
        return aiGoodsService.getUserGoods(userId);
    }

    // 굿즈 삭제
    @DeleteMapping("/{goodsId}")
    public void deleteGoods(@PathVariable Long goodsId, @RequestParam Long userId) {
        aiGoodsService.deleteGoods(goodsId, userId);
    }
} 