package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.PlaylistVideo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistVideoItemResponse {
    private UUID videoId;
    private String youtubeId;
    private String title;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private Integer position;
    private OffsetDateTime addedAt;

    public static PlaylistVideoItemResponse from(PlaylistVideo pv) {
        return PlaylistVideoItemResponse.builder()
                .videoId(pv.getVideo().getId())
                .youtubeId(pv.getVideo().getYoutubeId())
                .title(pv.getVideo().getTitle())
                .thumbnailUrl(pv.getVideo().getThumbnailUrl())
                .durationSeconds(pv.getVideo().getDurationSeconds())
                .position(pv.getPosition())
                .addedAt(pv.getAddedAt())
                .build();
    }

}
