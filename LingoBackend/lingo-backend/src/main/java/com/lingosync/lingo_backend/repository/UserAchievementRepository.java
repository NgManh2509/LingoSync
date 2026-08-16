package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.UserAchievement;
import com.lingosync.lingo_backend.entity.UserAchievementId;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, UserAchievementId> {
    List<UserAchievement> findById_UserId(UUID userId);

}
