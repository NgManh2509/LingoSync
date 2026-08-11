package com.lingosync.lingo_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class PlaylistVideoId implements Serializable {
    private static final long serialVersionUID = 824715363109699203L;
    @NotNull
    @Column(name = "playlist_id", nullable = false)
    private UUID playlistId;

    @NotNull
    @Column(name = "video_id", nullable = false)
    private UUID videoId;


}