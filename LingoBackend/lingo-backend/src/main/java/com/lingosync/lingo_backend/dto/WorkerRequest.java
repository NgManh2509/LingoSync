package com.lingosync.lingo_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerRequest {
    private String url;
    private String lang;
    private String tgt_lang;
}
