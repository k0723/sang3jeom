package com.example.review.controller;

import com.example.review.service.ReviewImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/images")
@Slf4j
@RequiredArgsConstructor
public class ImageController {

    private final ReviewImageService reviewImageService;

    @PostMapping("/presigned-url")
    public ResponseEntity<String> getPresignedUrl(@RequestBody Map<String, String> payload) {
        log.info("Received request for presigned url {}", payload.get("url"));
        String filename = payload.get("filename");
        if (filename == null || filename.isBlank()) {
            return ResponseEntity.badRequest().body("filename is required");
        }
        log.info("getPresignedUrl End!!");
        return ResponseEntity.ok(reviewImageService.getPresignedUrl(filename));
    }
}
