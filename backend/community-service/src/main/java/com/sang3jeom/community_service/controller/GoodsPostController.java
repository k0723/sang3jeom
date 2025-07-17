package com.sang3jeom.community_service.controller;

import com.sang3jeom.community_service.dto.CreateGoodsPostRequest;
import com.sang3jeom.community_service.dto.CreateGoodsPostResponse;
import com.sang3jeom.community_service.dto.GoodsPostDTO;
import com.sang3jeom.community_service.dto.UpdateGoodsPostRequest;
import com.sang3jeom.community_service.service.GoodsPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goods-posts")
@RequiredArgsConstructor
public class GoodsPostController {

    private final GoodsPostService goodsPostService;

    @PostMapping
    public ResponseEntity<CreateGoodsPostResponse> createGoodsPost(
            @RequestBody CreateGoodsPostRequest request) {
        // TODO: 실제 인증 정보에서 userId, userEmail, userName을 가져와야 함
        // 현재는 테스트용 하드코딩 값 사용
        Long userId = 1L;
        String userEmail = "test@example.com";
        String userName = "테스트유저";

        return ResponseEntity.ok(goodsPostService.createGoodsPost(request, userId, userEmail, userName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsPostDTO> getGoodsPost(@PathVariable Long id) {
        return ResponseEntity.ok(goodsPostService.getGoodsPost(id));
    }

    @GetMapping
    public ResponseEntity<List<GoodsPostDTO>> getAllGoodsPosts() {
        // TODO: 실제 인증 정보에서 userId를 가져와야 함. 현재는 테스트용 하드코딩
        Long userId = 1L;
        return ResponseEntity.ok(goodsPostService.getAllGoodsPosts(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GoodsPostDTO>> getGoodsPostsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(goodsPostService.getGoodsPostsByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoodsPostDTO> updateGoodsPost(@PathVariable Long id, @RequestBody UpdateGoodsPostRequest request) {
        // TODO: 실제 인증 정보에서 userId를 확인하여 권한 체크 필요
        GoodsPostDTO updated = goodsPostService.updateGoodsPost(id, request.getContent(), request.getImageUrl(), request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoodsPost(@PathVariable Long id) {
        // TODO: 실제 인증 정보에서 userId를 확인하여 권한 체크 필요
        goodsPostService.deleteGoodsPost(id);
        return ResponseEntity.noContent().build();
    }
}