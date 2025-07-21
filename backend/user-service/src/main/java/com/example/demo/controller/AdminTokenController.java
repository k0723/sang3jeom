package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/tokens")
@RequiredArgsConstructor
public class AdminTokenController {
  private final AuthService authService;

  /**
   * HTTP DELETE /admin/tokens/{jti}
   * 해당 JTI를 화이트리스트에서 삭제하고, 블랙리스트에 기록합니다.
   */
  @DeleteMapping("/{jti}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> revokeToken(@PathVariable String jti) {
    boolean existed = authService.revokeTokenByJti(jti);
    if (existed) {
      return ResponseEntity.noContent().build();
    } else {
      // 이미 없던 토큰이라면 404 리턴
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
                           .body(Map.of("error", "Token JTI not found"));
    }
  }
}
