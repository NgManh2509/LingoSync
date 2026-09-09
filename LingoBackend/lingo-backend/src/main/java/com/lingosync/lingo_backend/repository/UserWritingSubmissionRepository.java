package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lingosync.lingo_backend.entity.UserWritingSubmission;

@Repository
public interface UserWritingSubmissionRepository extends JpaRepository<UserWritingSubmission, UUID> {

    List<UserWritingSubmission> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<UserWritingSubmission> findByUserIdAndTaskIdOrderByCreatedAtDesc(UUID userId, UUID taskId);
}
