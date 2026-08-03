package com.lingosync.lingo_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.lingosync.lingo_backend.repository.VocabularyRepository;
import com.lingosync.lingo_backend.dto.SaveVocabularyRequest;
import com.lingosync.lingo_backend.dto.VocabularyResponse;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.DeckRepository;
import com.lingosync.lingo_backend.repository.FlashcardRepository;
import com.lingosync.lingo_backend.repository.SubtitleRepository;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.repository.VideoRepository;
import com.lingosync.lingo_backend.entity.Deck;
import com.lingosync.lingo_backend.entity.Flashcard;
import com.lingosync.lingo_backend.entity.Subtitles;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.entity.Videos;
import com.lingosync.lingo_backend.entity.Vocabulary;

@Service
@RequiredArgsConstructor
public class VocabularyService {
        private final UserRepository userRepository;
        private final VideoRepository videoRepository;
        private final VocabularyRepository vocabularyRepository;
        private final SubtitleRepository subtitleRepository;
        private final DeckRepository deckRepository;
        private final FlashcardRepository flashcardRepository;

        @Transactional
        public VocabularyResponse saveVocabulary(SaveVocabularyRequest req, String userEmail) {
                Users user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
                Videos video = null;
                if (req.getVideoId() != null) {
                        video = videoRepository.findById(req.getVideoId())
                                        .orElseThrow(() -> new RuntimeException("Không tìm thấy video"));
                }
                final Videos finalVideo = video;
                Subtitles subtitles = null;
                if (req.getVideoId() != null && req.getSequenceOrder() != null) {
                        subtitles = subtitleRepository
                                        .findByVideoIdAndSequenceOrder(req.getVideoId(), req.getSequenceOrder())
                                        .orElseGet(() -> subtitleRepository.save(Subtitles.builder().video(finalVideo)
                                                        .originalText(req.getSubtitleOriginalText())
                                                        .translatedText(req.getSubtitleTranslatedText())
                                                        .startTime(req.getStartTime())
                                                        .sequenceOrder(req.getSequenceOrder())
                                                        .build()));
                }
                final Subtitles finalSubtitles = subtitles;

                Vocabulary vocab = vocabularyRepository.findByUserIdAndWord(user.getId(), req.getWord())
                                .map(existing -> {
                                        existing.setDefinition(req.getDefinition());
                                        existing.setPhonetic(req.getPhonetic());
                                        existing.setSubtitle(finalSubtitles);

                                        return existing;
                                })
                                .orElseGet(() -> Vocabulary.builder().user(user).word(req.getWord())
                                                .definition(req.getDefinition())
                                                .phonetic(req.getPhonetic()).partOfSpeech(req.getPartOfSpeech())
                                                .sourceLanguage(req.getSourceLanguage())
                                                .targetLanguage(req.getTargetLanguage()).video(finalVideo)
                                                .subtitle(finalSubtitles).build());

                vocab = vocabularyRepository.save(vocab);
                Deck deck = deckRepository.findByUserIdAndName(user.getId(), "My Vocabulary")
                                .orElseGet(() -> deckRepository
                                                .save(Deck.builder().name("My Vocabulary").user(user).build()));

                if (!flashcardRepository.existsByDeckIdAndVocabularyId(deck.getId(), vocab.getId())) {
                        flashcardRepository.save(
                                        Flashcard.builder()
                                                        .deck(deck).vocabulary(vocab)
                                                        .status("NEW")
                                                        .intervalDays(0)
                                                        .easeFactor(2.5)
                                                        .repetitions(0)
                                                        .build());
                }

                return VocabularyResponse.from(vocab);
        }

        @Transactional(readOnly = true)
        public List<VocabularyResponse> getMyVocabulary(String userEmail) {
                Users user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
                return vocabularyRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                                .map(VocabularyResponse::from).toList();

        }

}
