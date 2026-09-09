package com.lingosync.lingo_backend.entity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ielts_writing_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IeltsWritingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "task_type", nullable = false, length = 20)
    @Builder.Default
    private String taskType = "Task 2";

    @Column(name = "essay_type", length = 100)
    private String essayType;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "outline", columnDefinition = "jsonb")
    private Map<String, Object> outline;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sample_answers", columnDefinition = "jsonb")
    private List<Map<String, Object>> sampleAnswers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "vocabulary", columnDefinition = "jsonb")
    private List<Object> vocabulary;

    @Column(name = "source_url", unique = true, columnDefinition = "TEXT")
    private String sourceUrl;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;
}
