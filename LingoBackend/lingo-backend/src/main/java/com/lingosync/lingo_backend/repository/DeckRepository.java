package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Deck;

public interface DeckRepository extends JpaRepository<Deck, UUID> {
    Optional<Deck> findByUserIdAndName(UUID userId, String name);

    List<Deck> findByUserId(UUID userId);

}

