package com.lingosync.lingo_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeckResponse {
    private UUID id;
    private String name;
    private String description;
    private Integer flashCardCount;
    private Integer dueCount;
    private OffsetDateTime createdAt;
}
