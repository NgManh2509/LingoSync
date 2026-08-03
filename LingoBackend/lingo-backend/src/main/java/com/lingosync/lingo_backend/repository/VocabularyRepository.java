package com.lingosync.lingo_backend.repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Vocabulary;

public interface VocabularyRepository extends JpaRepository<Vocabulary, UUID> {
    List<Vocabulary> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndWord(UUID userId, String word);

    Optional<Vocabulary> findByUserIdAndWord(UUID userId, String word);

}
