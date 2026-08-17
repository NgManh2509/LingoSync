package com.lingosync.lingo_backend.dto;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseResponse {
    private UUID videoId;
    private Integer totalQuestions;
    private List<ExerciseQuestion> questions;
}
