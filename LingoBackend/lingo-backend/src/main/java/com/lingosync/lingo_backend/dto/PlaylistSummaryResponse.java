package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
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
public class PlaylistSummaryResponse {
    private UUID id;
    private String name;
    private String description;
    private OffsetDateTime createdAt;
    private Integer totalVideos;

    public static PlaylistSummaryResponse from(Playlist playlist, int totalVideos) {
        return PlaylistSummaryResponse.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .createdAt(playlist.getCreatedAt())
                .totalVideos(totalVideos)
                .build();
    }
}
