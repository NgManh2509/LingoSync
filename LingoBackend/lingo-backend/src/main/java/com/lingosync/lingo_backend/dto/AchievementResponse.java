package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.Achievements;
import com.lingosync.lingo_backend.entity.UserAchievement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AchievementResponse {
    private UUID id;
    private String name;
    private String description;
    private String icon;
    private String requirementType;
    private Integer requirementValue;
    private Boolean isUnlocked;
    private OffsetDateTime unlockedAt;
    private Integer currentProgress;

    public static AchievementResponse from(Achievements achievement, UserAchievement userAchievement,
            int currentProgress) {
        boolean unlocked = userAchievement != null;
        return AchievementResponse.builder()
                .id(achievement.getId())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .icon(achievement.getIcon())
                .requirementType(achievement.getRequirementType())
                .requirementValue(achievement.getRequirementValue())
                .isUnlocked(unlocked)
                .unlockedAt(unlocked ? userAchievement.getAchievedAt() : null)
                .currentProgress(currentProgress)
                .build();
    }
}
