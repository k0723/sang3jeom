package com.example.demo.service;

import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserRepository;
import com.example.demo.dto.UserCreateRequestDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.demo.dto.UserDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo,
                       PasswordEncoder passwordEncoder
    ) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO create(UserCreateRequestDTO req) {
        // 1) username 중복 검사
        if (repo.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Username already exists: " + req.getUsername()
            );
        }
        // 2) email 중복 검사
        if (repo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already exists: " + req.getEmail()
            );
        }

        UserEntity user = req.toEntity();

        String rawPassword = req.getPassword();               // DTO에서 원문 비밀번호 가져오기
        String encodedPassword = passwordEncoder.encode(rawPassword);
        user.setPasswordHash(encodedPassword);  

        // 3) 저장
        UserEntity saved = repo.save(user);
        return UserDTO.fromEntity(saved);
    }

    public List<UserDTO> findAll() {
        return repo.findAll()
                   .stream()
                   .map(UserDTO::fromEntity)
                   .toList();
    }

    public UserDTO findById(Long id) {
        UserEntity u = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        return UserDTO.fromEntity(u);
    }

    public UserDTO update(Long id, UserCreateRequestDTO req) {
        UserEntity u = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        UserEntity saved = repo.save(u);
        return UserDTO.fromEntity(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        repo.deleteById(id);
    }
} 