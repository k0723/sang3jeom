package com.example.review.exception;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * IllegalArgumentException 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("❌ IllegalArgumentException 발생: {}", e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Bad Request");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * FeignException 처리 (다른 서비스 호출 실패)
     */
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(FeignException e) {
        log.error("🔗 Feign 통신 오류 발생: status={}, message={}", e.status(), e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        
        if (e.status() == 404) {
            errorResponse.put("error", "User Not Found");
            errorResponse.put("message", "요청한 사용자를 찾을 수 없습니다.");
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } else if (e.status() >= 500) {
            errorResponse.put("error", "External Service Error");
            errorResponse.put("message", "외부 서비스와의 통신에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            errorResponse.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        } else {
            errorResponse.put("error", "External Service Error");
            errorResponse.put("message", "외부 서비스 호출 중 오류가 발생했습니다.");
            errorResponse.put("status", HttpStatus.BAD_GATEWAY.value());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(errorResponse);
        }
    }

    /**
     * RuntimeException 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        log.error("💥 RuntimeException 발생: {}", e.getMessage(), e);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * 기타 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        log.error("🚨 예상치 못한 오류 발생: {}", e.getMessage(), e);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", "서버 내부 오류가 발생했습니다.");
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
