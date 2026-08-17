package com.lingosync.lingo_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseSubmitResponse {
    private Integer earnedXp;
    private Integer totalXp;
    private Integer level;
    private Integer nextLevelXp;
    private Integer currentStreak;
    private Boolean isStudiedToday;
    private List<AchievementResponse> newAchievementsUnlocked;
}
