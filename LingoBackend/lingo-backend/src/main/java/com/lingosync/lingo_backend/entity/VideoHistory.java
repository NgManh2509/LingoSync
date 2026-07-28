package com.lingosync.lingo_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "video_history", uniqueConstraints = {
        @UniqueConstraint(name = "uq_video_history", columnNames = { "user_id", "video_id" })
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VideoHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Videos video;

    @CreationTimestamp
    @Column(name = "watched_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime watchedAt;

    @Column(name = "last_position_seconds")
    @Builder.Default
    private Integer lastPositionSeconds = 0;

    @Column(name = "watch_count")
    @Builder.Default
    private Integer watchCount = 1;
}
