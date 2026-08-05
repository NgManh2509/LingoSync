package com.lingosync.lingo_backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lingosync.lingo_backend.entity.Flashcard;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    boolean existsByDeckIdAndVocabularyId(UUID deckId, UUID vocabularyId);

    List<Flashcard> findByDeckId(UUID deckId);

    @Query("SELECT f FROM Flashcard f WHERE f.deck.id = :deckId AND " +
            "(f.status = 'NEW' OR f.nextReviewDate <= :today)")
    List<Flashcard> findCardsForReview(@Param("deckId") UUID deckId,
            @Param("today") LocalDate today);
}
