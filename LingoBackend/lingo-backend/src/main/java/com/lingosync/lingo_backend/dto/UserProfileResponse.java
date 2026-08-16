package com.lingosync.lingo_backend.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.util.GamificationUtils;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private UUID id;
    private String username;
    private String avatarUrl;
    private Integer xpPoints;
    private Integer level;
    private Integer nextLevelXp;
    private Integer streakCount;
    private LocalDate lastActivityDate;
    private Boolean isStudiedToday;

    public static UserProfileResponse from(Users user) {
        int xp = user.getXpPoints() != null ? user.getXpPoints() : 0;
        int currentLevel = GamificationUtils.calculateLevel(xp);
        boolean studiedToday = user.getLastActivityDate() != null && user.getLastActivityDate().equals(LocalDate.now());

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .xpPoints(xp)
                .level(currentLevel)
                .nextLevelXp(GamificationUtils.getXpForLevel(currentLevel + 1))
                .streakCount(user.getStreakCount() != null ? user.getStreakCount() : 0)
                .lastActivityDate(user.getLastActivityDate())
                .isStudiedToday(studiedToday)
                .build();
    }

}
