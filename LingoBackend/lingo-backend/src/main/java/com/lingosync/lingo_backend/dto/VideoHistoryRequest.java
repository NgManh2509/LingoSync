package com.lingosync.lingo_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoHistoryRequest {
    @NotNull(message = "Vị trí dừng video không được để trống")
    @Min(value = 0, message = "Vị trí dừng video phải là số không âm")
    private Integer lastPositionSeconds;

    @Min(value = 0, message = "Thời gian xem phải lớn hơn hoặc bằng 0")
    private Integer watchedSeconds;
}
