package com.lingosync.lingo_backend.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.ExerciseResponse;
import com.lingosync.lingo_backend.dto.ExerciseSubmitRequest;
import com.lingosync.lingo_backend.dto.ExerciseSubmitResponse;
import com.lingosync.lingo_backend.service.ExerciseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final ExerciseService exerciseService;

    @GetMapping("/fill-in-the-blank")
    public ResponseEntity<ExerciseResponse> getFillInTheBlank(@RequestParam(required = false) UUID videoId,
            @RequestParam(required = false, defaultValue = "10") Integer limit, Authentication authentication) {
        String email = authentication.getName();
        ExerciseResponse res = exerciseService.generateExercises(email, videoId, limit);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/submit")
    public ResponseEntity<ExerciseSubmitResponse> submitExercise(@Valid @RequestBody ExerciseSubmitRequest req,
            Authentication authentication) {
        String email = authentication.getName();
        ExerciseSubmitResponse res = exerciseService.submitExercise(email, req);
        return ResponseEntity.ok(res);
    }
}
