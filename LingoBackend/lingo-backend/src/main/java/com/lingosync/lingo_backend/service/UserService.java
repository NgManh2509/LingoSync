package com.lingosync.lingo_backend.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lingosync.lingo_backend.dto.AchievementResponse;
import com.lingosync.lingo_backend.dto.UserProfileResponse;
import com.lingosync.lingo_backend.entity.Achievements;
import com.lingosync.lingo_backend.entity.UserAchievement;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.AchievementRepository;
import com.lingosync.lingo_backend.repository.StudyLogRepository;
import com.lingosync.lingo_backend.repository.UserAchievementRepository;
import com.lingosync.lingo_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final StudyLogRepository studyLogRepository;

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String email) {
        Users user = findUserByEmail(email);

        return UserProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<AchievementResponse> getAchievements(String email) {
        Users user = findUserByEmail(email);
        List<Achievements> allAchievements = achievementRepository.findAll();
        List<UserAchievement> unlockedList = userAchievementRepository.findById_UserId(user.getId());
        Map<UUID, UserAchievement> unlockedMap = unlockedList.stream()
                .collect(Collectors.toMap(ua -> ua.getId().getAchievementId(), ua -> ua));
        int streak = user.getStreakCount() != null ? user.getStreakCount() : 0;

        int totalWordsLearned = studyLogRepository.sumWordsLearnedByUserId(user.getId());
        int toatlVideosWatched = studyLogRepository.sumVideosWatchedByUserId(user.getId());

        return allAchievements.stream().map(achievement -> {
            UserAchievement unlocked = unlockedMap.get(achievement.getId());
            int currentProgress = calculateProgress(achievement.getRequirementType(), streak, totalWordsLearned,
                    toatlVideosWatched);
            return AchievementResponse.from(achievement, unlocked, currentProgress);
        }).collect(Collectors.toList());
    }

    private int calculateProgress(String type, int streak, int wordsLearned, int videosWatched) {
        if (type == null) {
            return 0;
        }
        return switch (type.toUpperCase()) {
            case "STREAK_DAYS", "DAILY_STREAK" -> streak;
            case "WORDS_LEARNED", "WORD_COUNT" -> wordsLearned;
            case "VIDEOS_WATCHED", "VIDEO_COUNT" -> videosWatched;
            default -> 0;
        };
    }

}
