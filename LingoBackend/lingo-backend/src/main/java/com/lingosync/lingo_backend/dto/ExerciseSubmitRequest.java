package com.lingosync.lingo_backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseSubmitRequest {
    private UUID videoId;
    @NotNull(message = "Tổng số câu hỏi trống")
    private Integer totalQuestions;

    @NotNull(message = "Số câu đúng trống")
    private Integer correctAnswers;

    @NotNull(message = "Thời gian làm bài không được để trống")
    private Integer timeSpentSeconds;

}
