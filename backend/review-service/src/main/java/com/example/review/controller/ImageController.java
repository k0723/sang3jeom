package com.example.review.controller;

import com.example.review.service.ReviewImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ReviewImageService reviewImageService;

    @PostMapping("/presigned-url")
    public ResponseEntity<String> getPresignedUrl(@RequestBody Map<String, String> payload) {
        String filename = payload.get("filename");
        if (filename == null || filename.isBlank()) {
            return ResponseEntity.badRequest().body("filename is required");
        }
        return ResponseEntity.ok(reviewImageService.getPresignedUrl(filename));
    }
}
