package com.lingosync.lingo_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private Integer totalWordsLearned;
    private Integer totalWordsReviewed;
    private Integer totalVideosWatched;
    private Integer totalStudyMinutes;
    private Integer currentStreak;
}
