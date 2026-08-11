package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.lingosync.lingo_backend.entity.PlaylistVideo;
import com.lingosync.lingo_backend.entity.PlaylistVideoId;

public interface PlaylistVideoRepository extends JpaRepository<PlaylistVideo, PlaylistVideoId> {
    int countById_PlaylistId(UUID playlistId);

    @Query("SELECT pv FROM PlaylistVideo pv JOIN FETCH pv.video WHERE pv.id.playlistId = :playlistId ORDER BY pv.position ASC")
    List<PlaylistVideo> findByPlaylistIdWithVideoOrderByPositionAsc(@Param("playlistId") UUID playlistId);

    @Query("SELECT COALESCE(MAX(pv.position), 0) FROM PlaylistVideo pv WHERE pv.id.playlistId = :playlistId")
    Integer findMaxPositionByPlaylistId(@Param("playlistId") UUID playlistId);

    boolean existsById_PlaylistIdAndId_VideoId(UUID playlistId, UUID videoId);

    @Transactional
    void deleteById_PlaylistIdAndId_VideoId(UUID playlistId, UUID videoId);
}
