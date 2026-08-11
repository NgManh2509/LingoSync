package com.lingosync.lingo_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePlaylistRequest {
    @NotBlank(message = "Tên playlist không được để trồng")
    @Size(max = 255)
    private String name;
    private String description;
}
