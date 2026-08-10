package com.lingosync.lingo_backend.repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lingosync.lingo_backend.entity.VideoHistory;

@Repository
public interface VideoHistoryRepository extends JpaRepository<VideoHistory, UUID> {
    Optional<VideoHistory> findByUser_IdAndVideo_Id(UUID userId, UUID videoId);

    @Query("SELECT vh FROM VideoHistory vh JOIN FETCH vh.video WHERE vh.user.id = :userId ORDER BY vh.watchedAt DESC")
    List<VideoHistory> findByUserIdWithVideoOrderByWatchedAtDesc(@Param("userId") UUID userId);
}
