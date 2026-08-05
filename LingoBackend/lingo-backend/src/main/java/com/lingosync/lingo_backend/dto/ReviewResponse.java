package com.lingosync.lingo_backend.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private UUID flashcardId;
    private String newStatus;
    private LocalDate nextReviewDate;
    private Integer intervalDays;
    private Double easeFactor;
    private Integer repetitions;
    private String message;
}
