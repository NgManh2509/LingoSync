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
public class ExerciseQuestion {
    private String questionId;
    private UUID vocabularyId;
    private Float audioTimestamp;
    private String sentenceWithBlank;
    private String originalSentence;
    private String targetWord;
    private String maskedWord;
    private String revealedChar;
    private Integer revealedIndex;
    private String hint;
}
