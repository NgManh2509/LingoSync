package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.Playlist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private OffsetDateTime createdAt;
    private List<PlaylistVideoItemResponse> videos;

    public static PlaylistDetailResponse from(Playlist playlist, List<PlaylistVideoItemResponse> videos) {
        return PlaylistDetailResponse.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .createdAt(playlist.getCreatedAt())
                .videos(videos)
                .build();
    }
}
