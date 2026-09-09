package com.lingosync.lingo_backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WritingSubmissionRequest {

    private UUID taskId;

    @NotBlank(message = "Content is required")
    private String content;

    @Builder.Default
    private Integer timeSpentSeconds = 0;
}
