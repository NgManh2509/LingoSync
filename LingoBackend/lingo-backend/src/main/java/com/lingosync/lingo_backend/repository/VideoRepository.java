package com.lingosync.lingo_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Videos;
import java.util.Optional;
import java.util.UUID;

public interface VideoRepository extends JpaRepository<Videos, UUID> {
    Optional<Videos> findByYoutubeIdAndTargetLanguage(String youtubeId, String targetLanguage);

}
