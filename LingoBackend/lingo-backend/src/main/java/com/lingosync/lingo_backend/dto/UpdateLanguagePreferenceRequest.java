package com.lingosync.lingo_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateLanguagePreferenceRequest {
    @NotBlank(message = "Target language trống")
    private String targetLanguage;

    private String nativeLanguage = "vi";
}
