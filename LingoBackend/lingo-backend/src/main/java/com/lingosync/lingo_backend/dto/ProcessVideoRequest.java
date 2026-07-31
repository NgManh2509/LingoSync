package com.lingosync.lingo_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessVideoRequest {
    @NotBlank(message = "URL không hợp lệ")
    private String youtubeUrl;

    @NotBlank(message = "Ngôn ngữ đích không hợp lệ")
    private String targetLanguage;

    private String originalLanguage;
}
