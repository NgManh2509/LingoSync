package com.lingosync.lingo_backend.dto;

import java.time.LocalDate;

import com.lingosync.lingo_backend.entity.StudyLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyLogResponse {
    private LocalDate date;
    private Integer wordsLearned;
    private Integer wordsReviewed;
    private Integer videosWatched;
    private Integer studyMinutes;

    public static StudyLogResponse from(StudyLog log) {
        return StudyLogResponse.builder()
                .date(log.getDate())
                .wordsLearned(log.getWordsLearned() != null ? log.getWordsLearned() : 0)
                .wordsReviewed(log.getWordsReviewed() != null ? log.getWordsReviewed() : 0)
                .videosWatched(log.getVideosWatched() != null ? log.getVideosWatched() : 0)
                .studyMinutes(log.getStudyMinutes() != null ? log.getStudyMinutes() : 0)
                .build();
    }

    public static StudyLogResponse empty(LocalDate date) {
        return StudyLogResponse.builder()
                .date(date)
                .wordsLearned(0)
                .wordsReviewed(0)
                .videosWatched(0)
                .studyMinutes(0)
                .build();
    }
}
