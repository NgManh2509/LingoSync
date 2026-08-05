package com.lingosync.lingo_backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardResponse {
    private UUID id;
    private UUID deckId;
    private String word;
    private String phonetic;
    private String definition;
    private String partOfSpeech;
    private String status;
    private LocalDate nextReviewDate;
    private Integer intervalDays;
    private Double easeFactor;
    private Integer repetitions;
    private OffsetDateTime lastReviewedAt;
}
