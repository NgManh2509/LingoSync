package com.lingosync.lingo_backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.DeckRequest;
import com.lingosync.lingo_backend.dto.DeckResponse;
import com.lingosync.lingo_backend.dto.FlashcardResponse;
import com.lingosync.lingo_backend.dto.ReviewRequest;
import com.lingosync.lingo_backend.dto.ReviewResponse;
import com.lingosync.lingo_backend.service.DeckService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {
    private final DeckService deckService;

    @GetMapping
    public ResponseEntity<List<DeckResponse>> getMyDecks(Authentication authentication) {
        return ResponseEntity.ok(deckService.getMyDecks(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<DeckResponse> createDeck(@Valid @RequestBody DeckRequest req, Authentication authentication) {
        return ResponseEntity.ok(deckService.createDeck(req, authentication.getName()));
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<DeckResponse> getDeckDetail(@PathVariable UUID deckId, Authentication authentication) {
        return ResponseEntity.ok(deckService.getDeckDetail(deckId, authentication.getName()));
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(@PathVariable UUID deckId, Authentication authentication) {
        deckService.deleteDeck(deckId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{deckId}/cards")
    public ResponseEntity<List<FlashcardResponse>> getCardsInDeck(@PathVariable UUID deckId,
            Authentication authentication) {
        return ResponseEntity.ok(deckService.getCardsInDeck(deckId, authentication.getName()));
    }

    @PostMapping("/{deckId}/add-vocab/{vocabId}")
    public ResponseEntity<FlashcardResponse> addVocabToDeck(
            @PathVariable UUID deckId,
            @PathVariable UUID vocabId,
            Authentication authentication) {
        return ResponseEntity.ok(deckService.addVocabToDeck(deckId, vocabId, authentication.getName()));
    }

    @GetMapping("/{deckId}/review")
    public ResponseEntity<List<FlashcardResponse>> getCardsForReview(
            @PathVariable UUID deckId,
            Authentication authentication) {
        return ResponseEntity.ok(deckService.getCardsForReview(deckId, authentication.getName()));
    }

    @PostMapping("/review")
    public ResponseEntity<ReviewResponse> submitReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(deckService.submitReview(request, authentication.getName()));
    }
}
