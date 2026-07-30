package com.lingosync.lingo_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "username", nullable = true, unique = true, length = 100)
    private String username;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "xp_points")
    @Builder.Default
    private Integer xpPoints = 0;

    @Column(name = "streak_count")
    @Builder.Default
    private Integer streakCount = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
