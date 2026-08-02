package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String username;
    private String avatarUrl;
    private Integer xpPoints;
    private Integer streakCount;
    private OffsetDateTime createdAt;

    public static UserResponse from(Users user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .xpPoints(user.getXpPoints())
                .streakCount(user.getStreakCount())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
