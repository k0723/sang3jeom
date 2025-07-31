package com.example.demo.controller;

import com.example.demo.domain.UserAiGoodsEntity;
import com.example.demo.dto.UserAiGoodsDTO;
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
        System.out.println("굿즈 저장 요청 - userId: " + userId + ", goodsType: " + goodsType + ", filename: " + file.getOriginalFilename());
        UserAiGoodsEntity savedGoods = aiGoodsService.saveAiGoods(userId, goodsType, file);
        System.out.println("굿즈 저장 완료 - id: " + savedGoods.getId() + ", imageUrl: " + savedGoods.getImageUrl());
        return savedGoods;
    }

    // 유저별 전체 굿즈 조회
    @GetMapping
    public List<UserAiGoodsDTO> getUserGoods(@RequestParam Long userId) {
        System.out.println("UserAiGoodsController.getUserGoods 호출 - userId: " + userId);
        List<UserAiGoodsDTO> goods = aiGoodsService.getUserGoods(userId);
        System.out.println("컨트롤러에서 반환할 굿즈 개수: " + goods.size());
        return goods;
    }

    // 굿즈 삭제
    @DeleteMapping("/{goodsId}")
    public void deleteGoods(@PathVariable Long goodsId, @RequestParam Long userId) {
        aiGoodsService.deleteGoods(goodsId, userId);
    }
} 