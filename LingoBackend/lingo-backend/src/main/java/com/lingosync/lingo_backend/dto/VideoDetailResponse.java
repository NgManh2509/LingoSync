package com.lingosync.lingo_backend.dto;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoDetailResponse {
    private UUID id;
    private String youtubeId;
    private String title;
    private String scriptUrl;
    private String status;
    private List<WorkerSubtitleItem> subtitles;

}
