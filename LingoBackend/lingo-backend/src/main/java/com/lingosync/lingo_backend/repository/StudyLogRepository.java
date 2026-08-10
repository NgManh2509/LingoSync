package com.lingosync.lingo_backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lingosync.lingo_backend.entity.StudyLog;

@Repository
public interface StudyLogRepository extends JpaRepository<StudyLog, UUID> {
    // user_Id = truy cập field "id" bên trong object "user" của StudyLog
    Optional<StudyLog> findByUser_IdAndDate(UUID userId, LocalDate date);

    List<StudyLog> findByUser_IdAndDateBetweenOrderByDateAsc(UUID userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.studyMinutes), 0) FROM StudyLog s WHERE s.user.id = :userId")
    Integer sumStudyMinutesByUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(s.videosWatched), 0) FROM StudyLog s WHERE s.user.id = :userId")
    Integer sumVideosWatchedByUserId(@Param("userId") UUID userId);

}
