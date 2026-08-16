package com.lingosync.lingo_backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lingosync.lingo_backend.dto.DashboardStatsResponse;
import com.lingosync.lingo_backend.dto.StudyLogResponse;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.StudyLogRepository;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.entity.StudyLog;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private final StudyLogRepository studyLogRepository;

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(String email) {
        Users user = findUserByEmail(email);

        return DashboardStatsResponse.builder()
                .totalWordsLearned(studyLogRepository.sumWordsLearnedByUserId(user.getId()))
                .totalWordsReviewed(studyLogRepository.sumWordsReviewedByUserId(user.getId()))
                .totalVideosWatched(studyLogRepository.sumVideosWatchedByUserId(user.getId()))
                .totalStudyMinutes(studyLogRepository.sumStudyMinutesByUserId(user.getId()))
                .currentStreak(user.getStreakCount() != null ? user.getStreakCount() : 0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StudyLogResponse> getStudyLogs(String email, String range, LocalDate from, LocalDate to) {
        Users user = findUserByEmail(email);

        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = today;
        if (from != null && to != null) {
            startDate = from;
            endDate = to;
        } else if ("month".equalsIgnoreCase(range)) {
            startDate = today.minusDays(29);
        } else {
            startDate = today.minusDays(6);
        }

        List<StudyLog> logs = studyLogRepository.findByUser_IdAndDateBetweenOrderByDateAsc(user.getId(), startDate,
                endDate);
        Map<LocalDate, StudyLog> logMap = logs.stream()
                .collect(Collectors.toMap(StudyLog::getDate, log -> log));

        List<StudyLogResponse> res = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (logMap.containsKey(current)) {
                res.add(StudyLogResponse.from(logMap.get(current)));
            } else {
                res.add(StudyLogResponse.empty(current));
            }
            current = current.plusDays(1);
        }
        return res;
    }
}
