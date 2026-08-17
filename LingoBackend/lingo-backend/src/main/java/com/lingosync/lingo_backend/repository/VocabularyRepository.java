package com.lingosync.lingo_backend.repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lingosync.lingo_backend.entity.Vocabulary;

public interface VocabularyRepository extends JpaRepository<Vocabulary, UUID> {
    List<Vocabulary> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndWord(UUID userId, String word);

    Optional<Vocabulary> findByUserIdAndWord(UUID userId, String word);

    List<Vocabulary> findByUserIdAndVideoId(UUID userId, UUID videoId);

    @Query("SELECT v.word FROM Vocabulary v WHERE v.user.id = :userId AND v.word != :excludeWord")
    List<String> findOtherWordsByUserId(@Param("userId") UUID userId, @Param("excludeWord") String excludeWord);
}
