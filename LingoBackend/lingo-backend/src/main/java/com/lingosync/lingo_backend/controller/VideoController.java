package com.lingosync.lingo_backend.controller;

import java.util.UUID;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.VideoDetailResponse;
import com.lingosync.lingo_backend.dto.VideoHistoryRequest;
import com.lingosync.lingo_backend.dto.VideoHistoryResponse;
import com.lingosync.lingo_backend.dto.ProcessVideoRequest;
import com.lingosync.lingo_backend.service.VideoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

    @GetMapping("/{videoId}")
    public ResponseEntity<VideoDetailResponse> getVideoDetail(@PathVariable UUID videoId) {
        VideoDetailResponse response = videoService.getVideoDetail(videoId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{videoId}/history")
    public ResponseEntity<VideoHistoryResponse> updateWatchHistory(@PathVariable UUID videoId,
            @Valid @RequestBody VideoHistoryRequest req,
            Authentication authentication) {
        String userEmail = authentication.getName();
        VideoHistoryResponse response = videoService.updateWatchHistory(videoId, req, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<VideoHistoryResponse>> getWatchHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        List<VideoHistoryResponse> response = videoService.getWatchHistory(userEmail);
        return ResponseEntity.ok(response);
    }

}
