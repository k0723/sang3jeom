package com.example.demo.controller;

import com.example.demo.client.UserClient;
import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserInfoDTO;
import com.example.demo.dto.UserPasswordDTO;
import com.example.demo.dto.UserUpdateDTO;
import com.example.demo.service.UserService;
import com.example.demo.service.TokenService;
import com.example.demo.dto.JwtResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "사용자 관리 API")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = {"http://localhost:5173", "https://sang3jeom.com"})
public class UserController {

    private final UserService svc;
    private final UserClient userClient;
    private final TokenService tokenService; 

    @Operation(summary = "모든 사용자 조회")
    @GetMapping
    public ResponseEntity<List<UserDTO>> listUsers() {
        return ResponseEntity.ok(svc.findAll());
    }

    @Operation(summary = "단일 사용자 조회")
    @GetMapping("/me")
    public ResponseEntity<UserInfoDTO> getUser(Authentication authentication) {
        log.info("GET /me 호출됨");
        log.info("Authentication: {}", authentication);
        
        // JWT 토큰에서 직접 userId 추출
        Long userId = null;
        if (authentication != null && authentication.getDetails() != null) {
            userId = (Long) authentication.getDetails();
            log.info("추출된 userId: {}", userId);
        } else {
            log.warn("authentication 또는 details가 null입니다");
        }
        
        if (userId == null) {
            log.error("userId를 추출할 수 없습니다");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String role = authentication.getAuthorities().stream()
            .findFirst()
            .map(granted -> granted.getAuthority())
            .orElse("ROLE_USER");
        
        UserInfoDTO dto = svc.findById(userId);
        log.info("사용자 정보 조회 완료: {}", dto);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "사용자 업데이트")
    @PutMapping("/me")
    public ResponseEntity<UserUpdateDTO> userUpdate(
        Authentication authentication,
        @RequestBody @Valid UserUpdateDTO req
    ) {
        Long userId = (Long) authentication.getDetails();
        svc.userUpdate(userId, req);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자 삭제")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        svc.delete(userId);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody @Valid UserPasswordDTO dto
    ) {
        Long userId = Long.valueOf(authentication.getName());
        svc.changePassword(userId, dto);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "ID로 단일 사용자 조회 (서비스 간 통신용)")
    @GetMapping
    ("/{id}")public ResponseEntity<UserInfoDTO> 
                    getUserById(@PathVariable Long id,
                    @CookieValue("accessToken") String accessToken)
    {
         UserInfoDTO dto = svc.findById(id); 
        return ResponseEntity.ok(dto); 
    }
}
