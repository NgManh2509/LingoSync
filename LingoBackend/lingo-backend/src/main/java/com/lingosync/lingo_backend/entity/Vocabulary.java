package com.lingosync.lingo_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vocabulary")
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "subtitle_id")
    private Subtitles subtitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "video_id")
    private Videos video;

    @Size(max = 255)
    @NotNull
    @Column(name = "word", nullable = false)
    private String word;

    @Size(max = 255)
    @Column(name = "phonetic")
    private String phonetic;

    @Column(name = "definition", columnDefinition = "TEXT")
    private String definition;

    @Size(max = 50)
    @Column(name = "part_of_speech", length = 50)
    private String partOfSpeech;

    @Size(max = 10)
    @Column(name = "source_language", length = 10)
    private String sourceLanguage;

    @Size(max = 10)
    @Column(name = "target_language", length = 10)
    private String targetLanguage;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;
}