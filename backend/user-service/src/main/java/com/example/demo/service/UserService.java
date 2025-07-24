package com.example.demo.service;

import com.example.demo.domain.UserEntity;
import com.example.demo.repository.UserRepository;

import jakarta.validation.Valid;

import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.UserPasswordDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserInfoDTO;
import com.example.demo.dto.UserUpdateDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;

@Service
@EnableCaching
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

    public UserInfoDTO findById(Long id) {
        UserEntity u = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        return UserInfoDTO.userInfo(u);
    }

    @CacheEvict(cacheNames="users", key="#id")
    @Transactional
    public UserUpdateDTO userUpdate(Long id, UserUpdateDTO req) {
        UserEntity u = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        u.setName(req.getName());
        u.setPhone(req.getPhone());
        u.setEmail(req.getEmail());

        UserEntity saved = repo.save(u);
        return UserUpdateDTO.userUpdate(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        repo.deleteById(id);
    }

    @Transactional
    public void changePassword(Long id, UserPasswordDTO dto) {
        UserEntity user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        // 1) 기존 비밀번호 검증
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "기존 비밀번호가 일치하지 않습니다.");
        }

        // 2) 새 비밀번호로 업데이트
        String encodedNewPassword = passwordEncoder.encode(dto.getNewPassword());
        user.setPasswordHash(encodedNewPassword);

        // 3) 저장
        repo.save(user);
    }
} 