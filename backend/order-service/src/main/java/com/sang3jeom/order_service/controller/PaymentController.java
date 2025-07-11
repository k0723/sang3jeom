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

    @GetMapping("/success")
    public ResponseEntity<KakaoPayApproveResponse> paySuccess(
            @RequestParam("pg_token") String pgToken,
            @RequestParam("tid") String tid,
            @RequestParam("partner_order_id") String orderId,
            @RequestParam("partner_user_id") String userId
    ) {
        KakaoPayApproveRequest request = new KakaoPayApproveRequest();
        request.setPg_token(pgToken);
        request.setTid(tid);
        request.setPartner_order_id(orderId);
        request.setPartner_user_id(userId);
        System.out.println(request);
        KakaoPayApproveResponse response = kakaoPayService.approvePayment(request);
        return ResponseEntity.ok(response);
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

