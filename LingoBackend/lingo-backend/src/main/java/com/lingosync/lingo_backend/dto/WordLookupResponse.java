package com.lingosync.lingo_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordLookupResponse {
    @JsonProperty("source_lang")
    private String sourceLang;

    @JsonProperty("target_lang")
    private String targetLang;

    @JsonProperty("original_word")
    private String originalWord;

    @JsonProperty("base_word")
    private String baseWord;

    private String phonetic;
    private String meaning;

}
