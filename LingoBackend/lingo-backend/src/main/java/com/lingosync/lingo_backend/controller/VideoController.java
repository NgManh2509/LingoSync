package com.lingosync.lingo_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.VideoDetailResponse;
import com.lingosync.lingo_backend.dto.ProcessVideoRequest;
import com.lingosync.lingo_backend.service.VideoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;

    @PostMapping("/process")
    public ResponseEntity<VideoDetailResponse> processVideo(@Valid @RequestBody ProcessVideoRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        VideoDetailResponse response = videoService.processVideo(request, userEmail);
        return ResponseEntity.ok(response);
    }
}
