package com.lingosync.lingo_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "study_logs", uniqueConstraints = {
        @UniqueConstraint(name = "uq_study_logs", columnNames = {"user_id", "date"})
})
public class StudyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id")
    private Users user;

    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @ColumnDefault("0")
    @Column(name = "words_learned")
    private Integer wordsLearned;

    @ColumnDefault("0")
    @Column(name = "words_reviewed")
    private Integer wordsReviewed;

    @ColumnDefault("0")
    @Column(name = "videos_watched")
    private Integer videosWatched;

    @ColumnDefault("0")
    @Column(name = "study_minutes")
    private Integer studyMinutes;
}