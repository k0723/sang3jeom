// src/main/java/com/example/demo/controller/UserController.java
package com.example.demo.controller;

import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserDto;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService svc;

    public UserController(UserService svc) {
        this.svc = svc;
    }

    // Create
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody @Valid UserCreateRequest req) {
        UserDto created = svc.create(req);
        return ResponseEntity
            .created(URI.create("/api/users/" + created.getId()))
            .body(created);
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers() {
        return ResponseEntity.ok(svc.findAll());
    }

    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(svc.findById(id));
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody @Valid UserCreateRequest req) {
        return ResponseEntity.ok(svc.update(id, req));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }
}
