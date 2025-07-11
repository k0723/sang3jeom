package com.sang3jeom.order_service.service;

import com.sang3jeom.order_service.dto.KakaoPayApproveRequest;
import com.sang3jeom.order_service.dto.KakaoPayApproveResponse;
import com.sang3jeom.order_service.dto.KakaoPayReadyRequest;
import com.sang3jeom.order_service.dto.KakaoPayReadyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoPayService {

    private final RestTemplate restTemplate;

    @Value("${kakao.secret-key}")
    private String kakaoSecretKey;

    public KakaoPayReadyResponse readyToPay(KakaoPayReadyRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON); // ✅ JSON으로 변경
        headers.set("Authorization", "SECRET_KEY " + kakaoSecretKey); // ✅ 공백 필수
        headers.set("Referer", "http://localhost:8080"); // ✅ 신버전 필수

        // JSON 형식으로 보낼 데이터
        Map<String, Object> body = new HashMap<>();
        body.put("cid", "TC0ONETIME");
        body.put("partner_order_id", request.getPartnerOrderId());
        body.put("partner_user_id", request.getPartnerUserId());
        body.put("item_name", request.getItemName());
        body.put("quantity", request.getQuantity()); // Integer
        body.put("total_amount", request.getTotalAmount()); // Integer
        body.put("tax_free_amount", request.getTaxFreeAmount()); // Integer
        body.put("approval_url", "http://localhost:8080/pay/success");
        body.put("cancel_url", "http://localhost:8080/pay/cancel");
        body.put("fail_url", "http://localhost:8080/pay/fail");

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<KakaoPayReadyResponse> response = restTemplate.postForEntity(
                    "https://open-api.kakaopay.com/online/v1/payment/ready",
                    requestEntity,
                    KakaoPayReadyResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.out.println("카카오페이 요청 실패: " + e.getResponseBodyAsString());
            throw e;
        }
    }

    public KakaoPayApproveResponse approvePayment(KakaoPayApproveRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "SECRET_KEY " + kakaoSecretKey);
        headers.set("Referer", "http://localhost:8080");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", "TC0ONETIME");
        params.add("tid", request.getTid());
        params.add("partner_order_id", request.getPartner_order_id());
        params.add("partner_user_id", request.getPartner_user_id());
        params.add("pg_token", request.getPg_token());
        System.out.println(params);
        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<KakaoPayApproveResponse> response = restTemplate.postForEntity(
                    "https://open-api.kakaopay.com/online/v1/payment/approve",
                    requestEntity,
                    KakaoPayApproveResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.out.println("결제 승인 실패: " + e.getResponseBodyAsString());
            throw e;
        }
    }

}
