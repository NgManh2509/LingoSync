package com.lingosync.lingo_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "flashcards")
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "deck_id")
    private Deck deck;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "vocabulary_id")
    private Vocabulary vocabulary;

    @Size(max = 50)
    @ColumnDefault("'NEW'")
    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    @ColumnDefault("0")
    @Column(name = "interval_days")
    private Integer intervalDays;

    @ColumnDefault("2.5")
    @Column(name = "ease_factor")
    private Double easeFactor;

    @ColumnDefault("0")
    @Column(name = "repetitions")
    private Integer repetitions;

    @Column(name = "last_reviewed_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime lastReviewedAt;
}