package com.lingosync.lingo_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Subtitles;

public interface SubtitleRepository extends JpaRepository<Subtitles, UUID> {

    Optional<Subtitles> findByVideoIdAndSequenceOrder(UUID videoId, Integer sequenceOrder);

}
