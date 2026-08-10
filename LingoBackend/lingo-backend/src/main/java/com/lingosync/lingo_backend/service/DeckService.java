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
import com.lingosync.lingo_backend.exception.ConflictException;
import com.lingosync.lingo_backend.exception.ForbiddenException;
import com.lingosync.lingo_backend.exception.ResourceNotFoundException;
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

    private Deck findDeckOwnedByUser(UUID deckId, UUID userId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck không tồn tại"));

        if (!deck.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Không có quyền truy cập deck này");
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

        return decks.stream().map(deck -> DeckResponse.builder()
                .id(deck.getId())
                .name(deck.getName())
                .description(deck.getDescription())
                .flashCardCount((int) flashcardRepository.countByDeckId(deck.getId()))
                .dueCount((int) flashcardRepository.countDueCards(deck.getId(), LocalDate.now()))
                .createdAt(deck.getCreatedAt())
                .build()).toList();
    }

    // Tạo deck mới cho user
    @Transactional
    public DeckResponse createDeck(DeckRequest req, String userEmail) {
        Users user = findUserByEmail(userEmail);
        if (deckRepository.findByUserIdAndName(user.getId(), req.getName()).isPresent()) {
            throw new ConflictException("Bạn đã có deck với tên này rồi");
        }
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

    @Transactional(readOnly = true)
    public DeckResponse getDeckDetail(UUID deckId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Deck deck = findDeckOwnedByUser(deckId, user.getId());
        return DeckResponse.builder()
                .id(deck.getId())
                .name(deck.getName())
                .description(deck.getDescription())
                .flashCardCount((int) flashcardRepository.countByDeckId(deck.getId()))
                .dueCount((int) flashcardRepository.countDueCards(deck.getId(), LocalDate.now()))
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

    // Lấy các card cần ôn hôm nay: card NEW hoặc đã đến hạn (nextReviewDate <=
    // today)
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
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard không tồn tại"));

        if (!flashcard.getDeck().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Không có quyền truy cập flashcard này");
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
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary không tồn tại"));

        if (!vocab.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Vocabulary không thuộc về bạn");
        }

        if (flashcardRepository.existsByDeckIdAndVocabularyId(deckId, vocabularyId)) {
            throw new ConflictException("Từ vựng này đã có trong deck này");
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

    @Transactional
    public DeckResponse updateDeck(UUID deckId, DeckRequest req, String userEmail) {
        Users user = findUserByEmail(userEmail);
        Deck deck = findDeckOwnedByUser(deckId, user.getId());
        if (!deck.getName().equals(req.getName())) {
            if (deckRepository.findByUserIdAndName(user.getId(), req.getName()).isPresent()) {
                throw new ConflictException("Bạn đã có deck với tên này rồi");
            }
        }
        deck.setName(req.getName());
        deck.setDescription(req.getDescription());
        deckRepository.save(deck);
        return DeckResponse.builder()
                .id(deck.getId())
                .name(deck.getName())
                .description(deck.getDescription())
                .flashCardCount((int) flashcardRepository.countByDeckId(deck.getId()))
                .dueCount((int) flashcardRepository.countDueCards(deck.getId(), LocalDate.now()))
                .createdAt(deck.getCreatedAt())
                .build();
    }

    @Transactional
    public void removeCardFromDeck(UUID deckId, UUID flashcardId, String userEmail) {
        Users user = findUserByEmail(userEmail);
        findDeckOwnedByUser(deckId, user.getId());

        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard không tồn tại"));
        if (!flashcard.getDeck().getId().equals(deckId)) {
            throw new ResourceNotFoundException("Flashcard không thuộc deck này");
        }
        flashcardRepository.delete(flashcard);
    }
}
