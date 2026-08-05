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
public class DeckRequest {
    @NotBlank(message = "Deck name is required")
    private String name;

    private String description;
}
