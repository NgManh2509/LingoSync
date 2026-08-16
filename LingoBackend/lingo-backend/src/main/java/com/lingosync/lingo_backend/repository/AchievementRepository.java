package com.lingosync.lingo_backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingosync.lingo_backend.entity.Achievements;

public interface AchievementRepository extends JpaRepository<Achievements, UUID> {

}
