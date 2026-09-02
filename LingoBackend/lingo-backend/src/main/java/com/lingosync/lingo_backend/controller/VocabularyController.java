package com.lingosync.lingo_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.SaveVocabularyRequest;
import com.lingosync.lingo_backend.dto.VocabularyResponse;
import com.lingosync.lingo_backend.dto.WordLookupResponse;
import com.lingosync.lingo_backend.service.VocabularyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {
    private final VocabularyService vocabularyService;

    @PostMapping("/save")
    public ResponseEntity<VocabularyResponse> saveVocabulary(
            @Valid @RequestBody SaveVocabularyRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(vocabularyService.saveVocabulary(request, authentication.getName()));
    }

    @GetMapping("/my-list")
    public ResponseEntity<List<VocabularyResponse>> getMyVocabulary(Authentication authentication) {
        return ResponseEntity.ok(vocabularyService.getMyVocabulary(authentication.getName()));
    }

    @GetMapping("/lookup")
    public ResponseEntity<WordLookupResponse> lookupWord(
            @RequestParam String word,
            @RequestParam(defaultValue = "en") String sourceLang,
            @RequestParam(defaultValue = "vi") String targetLang) {
        return ResponseEntity.ok(vocabularyService.lookupWord(word, sourceLang, targetLang));
    }
}
