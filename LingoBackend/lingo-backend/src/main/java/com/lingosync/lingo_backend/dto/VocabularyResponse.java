package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lingosync.lingo_backend.entity.Vocabulary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyResponse {
    private UUID id;
    private String word;
    private String phonetic;
    private String definition;
    private String partOfSpeech;
    private String sourceLanguage;
    private String targetLanguage;
    private UUID videoId;
    private OffsetDateTime createdAt;

    public static VocabularyResponse from(Vocabulary vocab) {
        return VocabularyResponse.builder()
                .id(vocab.getId())
                .word(vocab.getWord())
                .phonetic(vocab.getPhonetic())
                .definition(vocab.getDefinition())
                .partOfSpeech(vocab.getPartOfSpeech())
                .sourceLanguage(vocab.getSourceLanguage())
                .targetLanguage(vocab.getTargetLanguage())
                .videoId(vocab.getVideo() != null ? vocab.getVideo().getId() : null)
                .createdAt(vocab.getCreatedAt())
                .build();
    }
}
