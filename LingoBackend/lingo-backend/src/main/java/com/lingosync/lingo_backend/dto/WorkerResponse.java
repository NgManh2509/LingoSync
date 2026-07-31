package com.lingosync.lingo_backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerResponse {
    private String source;
    private List<WorkerSubtitleItem> data;
}
