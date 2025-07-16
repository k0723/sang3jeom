// src/main/java/com/example/demo/controller/UserController.java
package com.example.demo.controller;

import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.domain.UserEntity;
import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.domain.UserEntity;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.demo.dto.UserCreateRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;                                 // HttpStatus enum
import org.springframework.web.bind.annotation.ResponseStatus;              // @ResponseStatus
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.demo.dto.UserCreateRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;                                 // HttpStatus enum
import org.springframework.web.bind.annotation.ResponseStatus;              // @ResponseStatus
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;


import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "사용자 관리 API")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/users")
@Tag(name = "Users", description = "사용자 관리 API")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService svc;

    @Operation(summary = "모든 사용자 조회")
    @GetMapping
    public ResponseEntity<List<UserDTO>> listUsers() {
    public ResponseEntity<List<UserDTO>> listUsers() {
        return ResponseEntity.ok(svc.findAll());
    }

    @Operation(summary = "단일 사용자 조회")
    @Operation(summary = "단일 사용자 조회")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(
            @Parameter(description = "조회할 사용자 ID") 
            @PathVariable Long id) {
    public ResponseEntity<UserDTO> getUser(
            @Parameter(description = "조회할 사용자 ID") 
            @PathVariable Long id) {
        return ResponseEntity.ok(svc.findById(id));
    }

    @Operation(summary = "사용자 업데이트")
    @Operation(summary = "사용자 업데이트")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody @Valid UserCreateRequestDTO req) {
            @RequestBody @Valid UserCreateRequestDTO req) {
        return ResponseEntity.ok(svc.update(id, req));
    }

    @Operation(summary = "사용자 삭제")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "사용자 삭제")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        svc.delete(id);
    }
}
