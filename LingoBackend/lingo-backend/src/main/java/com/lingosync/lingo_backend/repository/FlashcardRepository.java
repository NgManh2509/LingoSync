package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Flashcard;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    boolean existsByDeckIdAndVocabularyId(UUID deckId, UUID vocabularyId);

    List<Flashcard> findByDeckId(UUID deckId);
}
