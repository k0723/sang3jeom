package com.sang3jeom.order_service.controller;

import com.sang3jeom.order_service.dto.KakaoPayApproveRequest;
import com.sang3jeom.order_service.dto.KakaoPayApproveResponse;
import com.sang3jeom.order_service.dto.KakaoPayReadyRequest;
import com.sang3jeom.order_service.dto.KakaoPayReadyResponse;
import com.sang3jeom.order_service.service.KakaoPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pay")
@RequiredArgsConstructor
public class PaymentController {

    private final KakaoPayService kakaoPayService;

    @PostMapping("/ready")
    public ResponseEntity<KakaoPayReadyResponse> readyToPay(@RequestBody KakaoPayReadyRequest request) {
        KakaoPayReadyResponse response = kakaoPayService.readyToPay(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approvePayment(@RequestBody KakaoPayApproveRequest requestDto) {
        try {
            ResponseEntity<String> response = kakaoPayService.approvePayment(requestDto);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/cancel")
    public String cancel() {
        return "결제 취소됨";
    }

    @GetMapping("/fail")
    public String fail() {
        return "결제 실패";
    }
}

