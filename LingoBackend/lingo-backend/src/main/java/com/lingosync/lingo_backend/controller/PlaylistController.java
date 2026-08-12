package com.lingosync.lingo_backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.CreatePlaylistRequest;
import com.lingosync.lingo_backend.dto.PlaylistDetailResponse;
import com.lingosync.lingo_backend.dto.PlaylistSummaryResponse;
import com.lingosync.lingo_backend.dto.PlaylistVideoItemResponse;
import com.lingosync.lingo_backend.dto.UpdatePlaylistRequest;
import com.lingosync.lingo_backend.service.PlaylistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    private final PlaylistService playlistService;

    @GetMapping
    public ResponseEntity<List<PlaylistSummaryResponse>> getMyPlaylists(Authentication authentication) {
        String userEmail = authentication.getName();
        List<PlaylistSummaryResponse> response = playlistService.getUserPlaylists(userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PlaylistSummaryResponse> createPlaylist(@Valid @RequestBody CreatePlaylistRequest req,
            Authentication authentication) {
        String userEmail = authentication.getName();
        PlaylistSummaryResponse res = playlistService.createPlaylist(userEmail, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<PlaylistDetailResponse> getPlaylistDetail(@PathVariable UUID playlistId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        PlaylistDetailResponse res = playlistService.getPlaylistDetail(userEmail, playlistId);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{playlistId}")
    public ResponseEntity<PlaylistSummaryResponse> updatePlaylist(@PathVariable UUID playlistId,
            @Valid @RequestBody UpdatePlaylistRequest req, Authentication authentication) {
        String userEmail = authentication.getName();
        PlaylistSummaryResponse res = playlistService.updatePlaylist(userEmail, playlistId, req);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable UUID playlistId, Authentication authentication) {
        String userEmail = authentication.getName();
        playlistService.deletePlaylist(userEmail, playlistId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{playlistId}/videos/{videoId}")
    public ResponseEntity<PlaylistVideoItemResponse> addVideoToPlaylist(@PathVariable UUID playlistId,
            @PathVariable UUID videoId, Authentication authentication) {
        String userEmail = authentication.getName();
        PlaylistVideoItemResponse res = playlistService.addVideoToPlaylist(userEmail, playlistId, videoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @DeleteMapping("/{playlistId}/videos/{videoId}")
    public ResponseEntity<Void> removeVideoFromPlaylist(@PathVariable UUID playlistId, @PathVariable UUID videoId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        playlistService.removeVideoFromPlaylist(userEmail, playlistId, videoId);
        return ResponseEntity.noContent().build(); // 204
    }

}
