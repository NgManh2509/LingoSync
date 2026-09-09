package com.lingosync.lingo_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lingosync.lingo_backend.entity.IeltsWritingTask;

@Repository
public interface IeltsWritingTaskRepository extends JpaRepository<IeltsWritingTask, UUID> {

    Page<IeltsWritingTask> findByEssayTypeIgnoreCase(String essayType, Pageable pageable);

    @Query("SELECT t FROM IeltsWritingTask t WHERE " +
            "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.question) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<IeltsWritingTask> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT t.essayType FROM IeltsWritingTask t WHERE t.essayType IS NOT NULL ORDER BY t.essayType")
    List<String> findDistinctEssayTypes();
}
