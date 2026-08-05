package com.lingosync.lingo_backend.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;


import org.springframework.stereotype.Service;

import com.lingosync.lingo_backend.dto.DeckRequest;
import com.lingosync.lingo_backend.dto.DeckResponse;
import com.lingosync.lingo_backend.dto.FlashcardResponse;
import com.lingosync.lingo_backend.dto.ReviewRequest;
import com.lingosync.lingo_backend.dto.ReviewResponse;
import com.lingosync.lingo_backend.entity.Deck;
import com.lingosync.lingo_backend.entity.Flashcard;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.entity.Vocabulary;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.DeckRepository;
import com.lingosync.lingo_backend.repository.FlashcardRepository;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.repository.VocabularyRepository;
import com.lingosync.lingo_backend.util.SM2Algorithm;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeckService {
    private final DeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;

    // Tìm user theo email, ném lỗi nếu không tồn tại
    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
    }

    // Tìm deck theo id và xác minh deck thuộc về user đang thao tác
    private Deck findDeckOwnedByUser(UUID deckId, UUID userId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck không tồn tại"));

        if (!deck.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền truy cập deck này");
        }

        return deck;
    }

    // Chuyển Flashcard entity + Vocabulary liên kết sang FlashcardResponse DTO
    private FlashcardResponse toFlashcardResponse(Flashcard flashcard) {
        Vocabulary vocab = flashcard.getVocabulary();
        return FlashcardResponse.builder()
                .id(flashcard.getId())
                .deckId(flashcard.getDeck().getId())
                .word(vocab.getWord())
                .phonetic(vocab.getPhonetic())
                .definition(vocab.getDefinition())
                .partOfSpeech(vocab.getPartOfSpeech())
                .nextReviewDate(flashcard.getNextReviewDate())
                .status(flashcard.getStatus())
                .intervalDays(flashcard.getIntervalDays())
                .easeFactor(flashcard.getEaseFactor())
                .lastReviewedAt(flashcard.getLastReviewedAt())
                .build();
    }

    // Lấy toàn bộ decks của user, kèm tổng số card và số card cần ôn hôm nay
    @Transactional(readOnly = true)
    public List<DeckResponse> getMyDecks(String userEmail) {
        Users user = findUserByEmail(userEmail);
        List<Deck> decks = deckRepository.findByUserId(user.getId());
        return decks.stream().map(deck -> {
            List<Flashcard> cards = flashcardRepository.findByDeckId(deck.getId());
            long dueCount = cards.stream()
                    .filter(fc -> "NEW".equals(fc.getStatus())
                            || (fc.getNextReviewDate() != null
                                    && !fc.getNextReviewDate().isAfter(LocalDate.now())))
                    .count();
            return DeckResponse.builder()
                    .id(deck.getId())
                    .name(deck.getName())
                    .description(deck.getDescription())
                    .flashCardCount(cards.size())
                    .dueCount((int) dueCount)
                    .createdAt(deck.getCreatedAt())
                    .build();
        }).toList();
    }

    // Tạo deck mới cho user
    @Transactional
    public DeckResponse createDeck(DeckRequest req, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Deck deck = Deck.builder().name(req.getName()).description(req.getDescription()).user(user).build();
        deck = deckRepository.save(deck);
        return DeckResponse.builder()
                .id(deck.getId())
                .name(deck.getName())
                .description(deck.getDescription())
                .flashCardCount(0)
                .dueCount(0)
                .createdAt(deck.getCreatedAt())
                .build();
    }

    // Xóa deck — kiểm tra ownership trước khi xóa
    @Transactional
    public void deleteDeck(UUID deckId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Deck deck = findDeckOwnedByUser(deckId, user.getId());
        deckRepository.delete(deck);
    }

    // Lấy thông tin chi tiết 1 deck (tên, mô tả, số card, số card cần ôn)
    @Transactional(readOnly = true)
    public DeckResponse getDeckDetail(UUID deckId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Deck deck = findDeckOwnedByUser(deckId, user.getId());
        List<Flashcard> cards = flashcardRepository.findByDeckId(deck.getId());
        long dueCount = cards.stream()
                .filter(fc -> "NEW".equals(fc.getStatus())
                        || (fc.getNextReviewDate() != null && !fc.getNextReviewDate().isAfter(LocalDate.now())))
                .count();
        return DeckResponse.builder()
                .id(deck.getId())
                .name(deck.getName())
                .description(deck.getDescription())
                .flashCardCount(cards.size())
                .dueCount((int) dueCount)
                .createdAt(deck.getCreatedAt())
                .build();
    }

    // Lấy toàn bộ flashcards trong deck (không lọc theo ngày ôn)
    @Transactional(readOnly = true)
    public List<FlashcardResponse> getCardsInDeck(UUID deckId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        findDeckOwnedByUser(deckId, user.getId());
        return flashcardRepository.findByDeckId(deckId).stream().map(this::toFlashcardResponse).toList();
    }

    // Lấy các card cần ôn hôm nay: card NEW hoặc đã đến hạn (nextReviewDate <= today)
    @Transactional(readOnly = true)
    public List<FlashcardResponse> getCardsForReview(UUID deckId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        findDeckOwnedByUser(deckId, user.getId());
        return flashcardRepository
                .findCardsForReview(deckId, LocalDate.now())
                .stream()
                .map(this::toFlashcardResponse)
                .toList();
    }

    // Nhận kết quả ôn tập (rating 0-5), chạy SM-2 và cập nhật trạng thái flashcard
    @Transactional
    public ReviewResponse submitReview(ReviewRequest req, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Flashcard flashcard = flashcardRepository.findById(req.getFlashcardId())
                .orElseThrow(() -> new RuntimeException("FlashCard không tồn tại"));

        if (!flashcard.getDeck().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền truy cập flashcard này");
        }

        SM2Algorithm.SM2Result res = SM2Algorithm.calculate(flashcard.getRepetitions(), flashcard.getIntervalDays(),
                flashcard.getEaseFactor(), req.getRating());

        flashcard.setRepetitions(res.newRepetitions());
        flashcard.setIntervalDays(res.newIntervalDays());
        flashcard.setEaseFactor(res.newEaseFactor());
        flashcard.setStatus(res.newStatus());
        flashcard.setNextReviewDate(res.nextReviewDate());
        flashcard.setLastReviewedAt(OffsetDateTime.now());
        flashcardRepository.save(flashcard);
        return ReviewResponse.builder()
                .flashcardId(flashcard.getId())
                .newStatus(res.newStatus())
                .nextReviewDate(res.nextReviewDate())
                .intervalDays(res.newIntervalDays())
                .easeFactor(res.newEaseFactor())
                .repetitions(res.newRepetitions())
                .message("Review submitted successfully")
                .build();
    }

    // Thêm một từ vựng có sẵn vào deck (tạo flashcard mới với trạng thái NEW)
    @Transactional
    public FlashcardResponse addVocabToDeck(UUID deckId, UUID vocabularyId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Deck deck = findDeckOwnedByUser(deckId, user.getId());

        Vocabulary vocab = vocabularyRepository.findById(vocabularyId)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found"));

        if (!vocab.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vocabulary không thuộc về bạn");
        }

        if (flashcardRepository.existsByDeckIdAndVocabularyId(deckId, vocabularyId)) {
            throw new RuntimeException("Từ vựng này đã có trong deck này");
        }

        Flashcard flashcard = flashcardRepository.save(
                Flashcard.builder()
                        .deck(deck)
                        .vocabulary(vocab)
                        .status("NEW")
                        .intervalDays(0)
                        .easeFactor(2.5)
                        .repetitions(0)
                        .build());
        return toFlashcardResponse(flashcard);
    }

}
