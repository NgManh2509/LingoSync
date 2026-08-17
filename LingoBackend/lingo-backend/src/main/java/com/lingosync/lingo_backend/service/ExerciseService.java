package com.lingosync.lingo_backend.service;

import com.lingosync.lingo_backend.repository.VocabularyRepository;
import com.lingosync.lingo_backend.util.GamificationUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lingosync.lingo_backend.dto.AchievementResponse;
import com.lingosync.lingo_backend.dto.ExerciseQuestion;
import com.lingosync.lingo_backend.dto.ExerciseResponse;
import com.lingosync.lingo_backend.dto.ExerciseSubmitRequest;
import com.lingosync.lingo_backend.dto.ExerciseSubmitResponse;
import com.lingosync.lingo_backend.entity.Achievements;
import com.lingosync.lingo_backend.entity.StudyLog;
import com.lingosync.lingo_backend.entity.Subtitles;
import com.lingosync.lingo_backend.entity.UserAchievement;
import com.lingosync.lingo_backend.entity.UserAchievementId;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.entity.Vocabulary;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.AchievementRepository;
import com.lingosync.lingo_backend.repository.StudyLogRepository;
import com.lingosync.lingo_backend.repository.UserAchievementRepository;
import com.lingosync.lingo_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExerciseService {
    private final VocabularyRepository vocabularyRepository;
    private final UserRepository userRepository;
    private final VocabularyService vocabularyService;
    private final StudyLogRepository studyLogRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final Random random = new Random();

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tim thấy người dùng"));
    }

    private static class MaskResult {
        String maskedWord;
        String revealedChar;
        Integer revealedIndex;

        MaskResult(String maskedWord, String revealedChar, int revealedIndex) {
            this.maskedWord = maskedWord;
            this.revealedChar = revealedChar;
            this.revealedIndex = revealedIndex;
        }
    }

    private MaskResult createWordMask(String word) {
        if (word == null || word.isEmpty()) {
            return new MaskResult("____", "_", 0);
        }
        int len = word.length();
        int revealIdx = random.nextInt(len);
        char revealChar = word.charAt(revealIdx);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < len; i++) {
            if (i == revealIdx) {
                sb.append(revealChar);
            } else {
                sb.append('_');
            }
        }
        return new MaskResult(sb.toString(), String.valueOf(revealChar), revealIdx);
    }

    private String replaceWordWithMask(String sentence, String targetWord, String mask) {
        if (sentence == null || targetWord == null)
            return sentence;
        Pattern pattern = Pattern.compile("\\b" + Pattern.quote(targetWord) + "\\b", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(sentence);
        if (matcher.find()) {
            return matcher.replaceFirst(mask);
        }
        return sentence.replace(targetWord, mask);
    }

    private int getMetricByReqType(String type, int streak, int wordsLearned, int videosWatched) {
        if (type == null)
            return 0;
        return switch (type.toUpperCase()) {
            case "STREAK_DAYS", "DAILY_STREAK" -> streak;
            case "WORDS_LEARNED", "WORD_COUNT" -> wordsLearned;
            case "VIDEOS_WATCHED", "VIDEO_COUNT" -> videosWatched;
            default -> 0;
        };
    }

    private List<AchievementResponse> checkAndUnlockAchievements(Users user) {
        UUID userId = user.getId();
        List<Achievements> allAchievements = achievementRepository.findAll();
        List<UserAchievement> unlockedList = userAchievementRepository.findById_UserId(userId);
        Set<UUID> unlockedIds = unlockedList.stream()
                .map(ua -> ua.getId().getAchievementId())
                .collect(Collectors.toSet());

        int streak = user.getStreakCount() != null ? user.getStreakCount() : 0;
        int wordsLearned = studyLogRepository.sumWordsLearnedByUserId(userId);
        int videosWatched = studyLogRepository.sumVideosWatchedByUserId(userId);

        List<AchievementResponse> newlyUnlocked = new ArrayList<>();

        for (Achievements achievement : allAchievements) {
            if (unlockedIds.contains(achievement.getId())) {
                continue;
            }

            int progress = getMetricByReqType(achievement.getRequirementType(), streak, wordsLearned, videosWatched);
            int target = achievement.getRequirementValue() != null ? achievement.getRequirementValue() : 0;

            if (target > 0 && progress >= target) {
                UserAchievement userAchievement = UserAchievement.builder()
                        .id(new UserAchievementId(userId, achievement.getId()))
                        .user(user)
                        .achievement(achievement)
                        .build();

                UserAchievement saved = userAchievementRepository.save(userAchievement);
                newlyUnlocked.add(AchievementResponse.from(achievement, saved, progress));
            }
        }

        return newlyUnlocked;
    }

    @Transactional(readOnly = true)
    public ExerciseResponse generateExercises(String userEmail, UUID videoId, Integer limit) {
        Users user = findUserByEmail(userEmail);
        int maxQues = (limit != null && limit > 0) ? limit : 10;

        List<Vocabulary> vocabList;
        if (videoId != null) {
            vocabList = vocabularyRepository.findByUserIdAndVideoId(user.getId(), videoId);
        } else {
            vocabList = vocabularyRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        if (vocabList.isEmpty()) {
            return ExerciseResponse.builder().videoId(videoId).totalQuestions(0).questions(Collections.emptyList())
                    .build();
        }

        Collections.shuffle(vocabList);
        List<Vocabulary> selectedVocab = vocabList.stream().limit(maxQues).collect(Collectors.toList());
        List<ExerciseQuestion> questions = new ArrayList<>();
        int qIndex = 1;
        for (Vocabulary vocab : selectedVocab) {
            String targetWord = vocab.getWord();
            Subtitles sub = vocab.getSubtitle();
            String originalSentence = (sub != null && sub.getOriginalText() != null && !sub.getOriginalText().isBlank())
                    ? sub.getOriginalText()
                    : "word: " + targetWord;

            Float timestamp = (sub != null) ? sub.getStartTime() : 0.0f;

            String hint = (sub != null && sub.getTranslatedText() != null && !sub.getTranslatedText().isBlank())
                    ? sub.getTranslatedText()
                    : vocab.getDefinition();

            MaskResult maskRes = createWordMask(targetWord);

            String sentenceWithBlank = replaceWordWithMask(originalSentence, targetWord, maskRes.maskedWord);

            questions.add(ExerciseQuestion.builder().questionId("q_" + qIndex++).vocabularyId(vocab.getId())
                    .audioTimestamp(timestamp).originalSentence(originalSentence).sentenceWithBlank(sentenceWithBlank)
                    .targetWord(targetWord).maskedWord(maskRes.maskedWord).revealedChar(maskRes.revealedChar)
                    .revealedIndex(maskRes.revealedIndex).hint(hint).build());

        }

        return ExerciseResponse.builder().videoId(videoId).totalQuestions(questions.size()).questions(questions)
                .build();
    }

    @Transactional
    public ExerciseSubmitResponse submitExercise(String email, ExerciseSubmitRequest request) {
        Users user = findUserByEmail(email);
        UUID userId = user.getId();
        LocalDate today = LocalDate.now();
        int earnedXp = request.getCorrectAnswers() * 10;
        int currXp = (user.getXpPoints() != null ? user.getXpPoints() : 0) + earnedXp;
        user.setXpPoints(currXp);
        LocalDate lastDate = user.getLastActivityDate();
        int streak = user.getStreakCount() != null ? user.getStreakCount() : 0;

        if (lastDate == null || lastDate.isBefore(today.minusDays(1))) {
            streak = 1;
        } else if (lastDate.equals(today.minusDays(1))) {
            streak += 1;
        }
        user.setStreakCount(streak);
        user.setLastActivityDate(today);
        userRepository.save(user);
        StudyLog studyLog = studyLogRepository.findByUser_IdAndDate(userId, today)
                .orElseGet(() -> StudyLog.builder().user(user)
                        .date(today)
                        .wordsLearned(0)
                        .wordsReviewed(0)
                        .videosWatched(0)
                        .studyMinutes(0)
                        .build());
        int currentReviewed = (studyLog.getWordsReviewed() != null ? studyLog.getWordsReviewed() : 0)
                + request.getTotalQuestions();
        int currentMinutes = (studyLog.getStudyMinutes() != null ? studyLog.getStudyMinutes() : 0)
                + Math.max(1, request.getTimeSpentSeconds() / 60);
        studyLog.setWordsReviewed(currentReviewed);
        studyLog.setStudyMinutes(currentMinutes);
        studyLogRepository.save(studyLog);

        List<AchievementResponse> newAchievements = checkAndUnlockAchievements(user);
        int currentLevel = GamificationUtils.calculateLevel(currXp);
        int nextLevelXp = GamificationUtils.getXpForLevel(currentLevel + 1);
        return ExerciseSubmitResponse.builder().earnedXp(earnedXp).totalXp(currXp).nextLevelXp(nextLevelXp)
                .level(currentLevel)
                .currentStreak(streak)
                .isStudiedToday(true)
                .newAchievementsUnlocked(newAchievements)
                .build();
    }
}
