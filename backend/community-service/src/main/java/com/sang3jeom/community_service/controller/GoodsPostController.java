package com.sang3jeom.community_service.controller;

import com.sang3jeom.community_service.dto.CreateGoodsPostRequest;
import com.sang3jeom.community_service.dto.CreateGoodsPostResponse;
import com.sang3jeom.community_service.dto.GoodsPostDTO;
import com.sang3jeom.community_service.dto.UpdateGoodsPostRequest;
import com.sang3jeom.community_service.service.GoodsPostService;
import com.sang3jeom.community_service.config.UserServiceClient;
import com.sang3jeom.community_service.dto.UserInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goods-posts")
@RequiredArgsConstructor
public class GoodsPostController {

    private final GoodsPostService goodsPostService;
    private final UserServiceClient userServiceClient;

    @PostMapping
    public ResponseEntity<CreateGoodsPostResponse> createGoodsPost(
            @RequestBody CreateGoodsPostRequest request,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[GoodsPostController] 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("userInfo.getUserId(): " + userInfo.getUserId());
        System.out.println("userInfo.getName(): " + userInfo.getName());
        System.out.println("userInfo.getEmail(): " + userInfo.getEmail());

        return ResponseEntity.ok(goodsPostService.createGoodsPost(request, 
            userInfo.getUserId().longValue(), 
            userInfo.getEmail(), 
            userInfo.getName()));
    }

/*    // 상상공간에 게시글 직접 등록
    @PostMapping("/direct")
    public ResponseEntity<CreateDirectGoodsPostResponse> createDirectGoodsPost(@RequestBody CreateDirectGoodsPostRequest request) {
        // TODO: 실제 인증 정보에서 userId, userEmail, userName을 가져와야 함
        Long userId = 1L;
        String userEmail = "test@example.com";
        String userName = "테스트유저";
        return ResponseEntity.ok(goodsPostService.createDirectGoodsPost(request, userId, userEmail, userName));
    }*/

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
    public ResponseEntity<GoodsPostDTO> updateGoodsPost(
            @PathVariable Long id, 
            @RequestBody UpdateGoodsPostRequest request,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[GoodsPostController] 게시글 수정 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("수정 요청 유저 ID: " + userInfo.getUserId());
        System.out.println("수정 요청 유저 이름: " + userInfo.getName());
        
        // 권한 체크: 본인이 작성한 게시글만 수정 가능
        GoodsPostDTO existingPost = goodsPostService.getGoodsPost(id);
        if (!existingPost.getUserId().equals(userInfo.getUserId().longValue())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        GoodsPostDTO updated = goodsPostService.updateGoodsPost(id, request.getContent(), request.getImageUrl(), request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoodsPost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        System.out.println("[GoodsPostController] 게시글 삭제 - 전달받은 Authorization 헤더: " + token);
        
        UserInfoDTO userInfo = userServiceClient.getUserInfo(token);
        System.out.println("삭제 요청 유저 ID: " + userInfo.getUserId());
        System.out.println("삭제 요청 유저 이름: " + userInfo.getName());
        
        // 권한 체크: 본인이 작성한 게시글만 삭제 가능
        GoodsPostDTO existingPost = goodsPostService.getGoodsPost(id);
        if (!existingPost.getUserId().equals(userInfo.getUserId().longValue())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        goodsPostService.deleteGoodsPost(id);
        return ResponseEntity.noContent().build();
    }
}