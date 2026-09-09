package com.lingosync.lingo_backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WritingSubmissionResponse {
    private UUID id;
    private UUID taskId;
    private String taskTitle;
    private String taskQuestion;
    private String essayType;
    private String content;
    private Integer wordCount;
    private Integer timeSpentSeconds;
    private BigDecimal bandScore;
    private Map<String, Object> evaluation;
    private String status;
    private OffsetDateTime createdAt;
}
