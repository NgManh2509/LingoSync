package com.lingosync.lingo_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "achievements")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Achievements {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon", columnDefinition = "TEXT")
    private String icon;

    @Column(name = "requirement_type", length = 50)
    private String requirementType;

    @Column(name = "requirement_value")
    private Integer requirementValue;
}
