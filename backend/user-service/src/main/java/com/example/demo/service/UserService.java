// src/main/java/com/example/demo/service/UserService.java
package com.example.demo.service;

import com.example.demo.domain.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public UserDto create(UserCreateRequest req) {
        User saved = repo.save(req.toEntity());
        return UserDto.fromEntity(saved);
    }

    public List<UserDto> findAll() {
        return repo.findAll()
                   .stream()
                   .map(UserDto::fromEntity)
                   .toList();
    }

    public UserDto findById(Long id) {
        User u = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        return UserDto.fromEntity(u);
    }

    public UserDto update(Long id, UserCreateRequest req) {
        User u = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        User saved = repo.save(u);
        return UserDto.fromEntity(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        repo.deleteById(id);
    }
}
