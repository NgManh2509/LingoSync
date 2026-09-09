package com.lingosync.lingo_backend.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.lingosync.lingo_backend.dto.WritingSubmissionRequest;
import com.lingosync.lingo_backend.dto.WritingSubmissionResponse;
import com.lingosync.lingo_backend.entity.IeltsWritingTask;
import com.lingosync.lingo_backend.service.IeltsWritingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ielts")
@RequiredArgsConstructor
public class IeltsWritingController {
    private final IeltsWritingService ieltsWritingService;

    @GetMapping("/tasks")
    public ResponseEntity<Page<IeltsWritingTask>> getTasks(@RequestParam(required = false) String essayType,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ieltsWritingService.getTasks(essayType, keyword, pageable));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<IeltsWritingTask> getTaskById(@PathVariable UUID id) {
        return ResponseEntity.ok(ieltsWritingService.getTaskById(id));
    }

    @GetMapping("/essay-types")
    public ResponseEntity<List<String>> getEssayTypes() {
        return ResponseEntity.ok(ieltsWritingService.getDistinctEssayTypes());
    }

    @PostMapping("/submissions")
    public ResponseEntity<WritingSubmissionResponse> submitEssay(
            @Valid @RequestBody WritingSubmissionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ieltsWritingService.submitEssay(request, authentication.getName()));
    }

    @GetMapping("/submissions/history")
    public ResponseEntity<List<WritingSubmissionResponse>> getSubmissionHistory(Authentication authentication) {
        return ResponseEntity.ok(ieltsWritingService.getUserSubmissions(authentication.getName()));
    }

}
