package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Playlist;

public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {

    List<Playlist> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<Playlist> findByUser_IdAndName(UUID userId, String name);

    Optional<Playlist> findByIdAndUser_Id(UUID id, UUID userId);

}
