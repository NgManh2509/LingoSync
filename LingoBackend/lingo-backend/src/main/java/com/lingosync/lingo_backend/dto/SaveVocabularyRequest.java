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
public class SaveVocabularyRequest {
    @NotBlank(message = "Từ bị trống")
    private String word;

    private String phonetic;
    private String definition;
    private String partOfSpeech;
    private String sourceLanguage;
    private String targetLanguage;
    private UUID videoId;
    private String subtitleOriginalText;
    private String subtitleTranslatedText;
    private Float startTime;
    private Integer sequenceOrder;
}
