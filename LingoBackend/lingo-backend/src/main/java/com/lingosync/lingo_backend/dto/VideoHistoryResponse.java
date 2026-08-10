package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.VideoHistory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoHistoryResponse {
    private UUID id;
    private UUID videoId;
    private String youtubeId;
    private String title;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private Integer lastPositionSeconds;
    private Integer watchCount;
    private OffsetDateTime watchedAt;

    public static VideoHistoryResponse from(VideoHistory history) {
        return VideoHistoryResponse.builder()
                .id(history.getId())
                .videoId(history.getVideo().getId())
                .youtubeId(history.getVideo().getYoutubeId())
                .title(history.getVideo().getTitle())
                .thumbnailUrl(history.getVideo().getThumbnailUrl())
                .durationSeconds(history.getVideo().getDurationSeconds())
                .lastPositionSeconds(history.getLastPositionSeconds())
                .watchCount(history.getWatchCount())
                .watchedAt(history.getWatchedAt())
                .build();
    }
}
