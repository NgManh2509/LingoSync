package com.lingosync.lingo_backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lingosync.lingo_backend.dto.WritingSubmissionRequest;
import com.lingosync.lingo_backend.dto.WritingSubmissionResponse;
import com.lingosync.lingo_backend.entity.IeltsWritingTask;
import com.lingosync.lingo_backend.entity.UserWritingSubmission;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.exception.ResourceNotFoundException;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.IeltsWritingTaskRepository;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.repository.UserWritingSubmissionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IeltsWritingService {
    private final IeltsWritingTaskRepository ieltsWritingTaskRepository;

    private final UserWritingSubmissionRepository userWritingSubmissionRepository;

    private final UserRepository userRepository;

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tim thấy người dùng"));
    }

    public Page<IeltsWritingTask> getTasks(String essayType, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ieltsWritingTaskRepository.searchByKeyword(keyword.trim(), pageable);
        }

        if (essayType != null && !essayType.trim().isEmpty()) {
            return ieltsWritingTaskRepository.findByEssayTypeIgnoreCase(essayType.trim(), pageable);
        }
        return ieltsWritingTaskRepository.findAll(pageable);
    }

    public IeltsWritingTask getTaskById(UUID id) {
        return ieltsWritingTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề bài với ID: " + id));
    }

    public List<String> getDistinctEssayTypes() {
        return ieltsWritingTaskRepository.findDistinctEssayTypes();
    }

    @Transactional
    public WritingSubmissionResponse submitEssay(WritingSubmissionRequest req, String userEmail) {
        Users user = findUserByEmail(userEmail);

        IeltsWritingTask task = null;
        if(req.getTaskId() != null){
            task = ieltsWritingTaskRepository.findById(req.getTaskId()).orElseThrow(() -> new ResourceNotFoundException("Đề thi không tồn tại"));
        }

        int wordCount = 0;
        if(req.getContent() != null && !req.getContent().trim().isEmpty()){
            wordCount = req.getContent().trim().split("\\s+").length;
        }

        UserWritingSubmission submission = UserWritingSubmission.builder()
                .user(user)
                .task(task)
                .content(req.getContent())
                .wordCount(wordCount)
                .timeSpentSeconds(req.getTimeSpentSeconds() != null ? req.getTimeSpentSeconds() : 0)
                .status("COMPLETED")
                .createdAt(OffsetDateTime.now())
                .build();
        submission = userWritingSubmissionRepository.save(submission);
        return mapToResponse(submission);
    }

    public List<WritingSubmissionResponse> getUserSubmissions(String userEmail){
        Users user = findUserByEmail(userEmail);
        return userWritingSubmissionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private WritingSubmissionResponse mapToResponse(UserWritingSubmission sub) {
        return WritingSubmissionResponse.builder()
                .id(sub.getId())
                .taskId(sub.getTask() != null ? sub.getTask().getId() : null)
                .taskTitle(sub.getTask() != null ? sub.getTask().getTitle() : "Tự do luyện viết")
                .taskQuestion(sub.getTask() != null ? sub.getTask().getQuestion() : null)
                .essayType(sub.getTask() != null ? sub.getTask().getEssayType() : null)
                .content(sub.getContent())
                .wordCount(sub.getWordCount())
                .timeSpentSeconds(sub.getTimeSpentSeconds())
                .bandScore(sub.getBandScore())
                .evaluation(sub.getEvaluation())
                .status(sub.getStatus())
                .createdAt(sub.getCreatedAt())
                .build();
    }
}
