package com.example.demo.controller;

import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserInfoDTO;
import com.example.demo.dto.UserUpdateDTO;
import com.example.demo.service.UserService;
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

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "사용자 관리 API")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService svc;

    @Operation(summary = "모든 사용자 조회")
    @GetMapping
    public ResponseEntity<List<UserDTO>> listUsers() {
        return ResponseEntity.ok(svc.findAll());
    }

    @Operation(summary = "단일 사용자 조회")
    @GetMapping("/{id}")
    public ResponseEntity<UserInfoDTO> getUser(
            @Parameter(description = "조회할 사용자 ID")
            @PathVariable Long id) {
        UserInfoDTO dto = svc.findById(id);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "사용자 업데이트")
    @PutMapping("/{id}")
    public ResponseEntity<UserUpdateDTO> userUpdate(
            @PathVariable Long id,
            @RequestBody UserUpdateDTO req) {
        svc.userUpdate(id, req);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자 삭제")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        svc.delete(id);
    }
}
