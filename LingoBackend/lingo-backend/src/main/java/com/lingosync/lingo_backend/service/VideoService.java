package com.lingosync.lingo_backend.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lingosync.lingo_backend.dto.ProcessVideoRequest;
import com.lingosync.lingo_backend.dto.VideoDetailResponse;
import com.lingosync.lingo_backend.dto.VideoHistoryRequest;
import com.lingosync.lingo_backend.dto.VideoHistoryResponse;
import com.lingosync.lingo_backend.dto.WorkerRequest;
import com.lingosync.lingo_backend.dto.WorkerResponse;
import com.lingosync.lingo_backend.dto.WorkerSubtitleItem;
import com.lingosync.lingo_backend.entity.StudyLog;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.entity.VideoHistory;
import com.lingosync.lingo_backend.entity.Videos;
import com.lingosync.lingo_backend.exception.ResourceNotFoundException;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.exception.WorkerApiException;
import com.lingosync.lingo_backend.repository.StudyLogRepository;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.repository.VideoHistoryRepository;
import com.lingosync.lingo_backend.repository.VideoRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class VideoService {
        private final VideoRepository videoRepository;
        private final UserRepository userRepository;
        private final RestClient restClient;
        private final Cloudinary cloudinary;
        private final ObjectMapper objectMapper;
        private final VideoHistoryRepository videoHistoryRepository;
        private final StudyLogRepository studyLogRepository;

        private String uploadScript(UUID videoId, List<WorkerSubtitleItem> data) throws Exception {
                String json = objectMapper.writeValueAsString(data);
                byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

                Map uploadResult = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                                "public_id", "scripts/" + videoId,
                                "resource_type", "raw",
                                "format", "json",
                                "overwrite", true));
                return (String) uploadResult.get("secure_url");
        }

        private String extractYoutubeId(String url) {
                String regex = "(?<=watch\\?v=|/videos/|embed/|youtu\\.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=)[^#&?]*";
                Pattern pattern = Pattern.compile(regex);
                Matcher matcher = pattern.matcher(url);
                if (matcher.find()) {
                        return matcher.group();
                }
                return url;
        }

        public VideoDetailResponse processVideo(ProcessVideoRequest request, String userEmail) {
                String youtubeId = extractYoutubeId(request.getYoutubeUrl());

                Optional<Videos> existingVideos = videoRepository.findByYoutubeIdAndTargetLanguage(youtubeId,
                                request.getTargetLanguage());
                if (existingVideos.isPresent()) {
                        Videos video = existingVideos.get();
                        return VideoDetailResponse.builder()
                                        .id(video.getId())
                                        .youtubeId(video.getYoutubeId())
                                        .title(video.getTitle())
                                        .scriptUrl(video.getScriptUrl())
                                        .status(video.getStatus())
                                        .subtitles(null)
                                        .build();
                }
                Users user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UserNotFoundException("User not found"));

                Videos newVideos = Videos.builder().user(user).youtubeId(youtubeId)
                                .originalLanguage(request.getOriginalLanguage() != null ? request.getOriginalLanguage()
                                                : "en")
                                .targetLanguage(request.getTargetLanguage()).status("PENDING").build();

                Videos savedVideo = videoRepository.save(newVideos);

                WorkerRequest workerReq = WorkerRequest.builder().url(request.getYoutubeUrl())
                                .lang(request.getOriginalLanguage() != null ? request.getOriginalLanguage() : "en")
                                .tgt_lang(request.getTargetLanguage()).build();

                try {
                        WorkerResponse workerRes = restClient.post().uri("/get_subtitles").body(workerReq).retrieve()
                                        .body(WorkerResponse.class);

                        String scriptUrl = uploadScript(savedVideo.getId(), workerRes.getData());

                        savedVideo.setStatus("READY");
                        savedVideo.setScriptUrl(scriptUrl);
                        videoRepository.save(savedVideo);

                        return VideoDetailResponse.builder()
                                        .id(savedVideo.getId())
                                        .youtubeId(savedVideo.getYoutubeId())
                                        .title(savedVideo.getTitle())
                                        .status(savedVideo.getStatus())
                                        .subtitles(workerRes != null ? workerRes.getData() : null)
                                        .build();
                } catch (Exception e) {
                        savedVideo.setStatus("FAILED");
                        videoRepository.save(savedVideo);
                        throw new WorkerApiException("Worker API failed: " + e.getMessage());
                }
        }

        public VideoDetailResponse getVideoDetail(UUID videoId) {
                Videos video = videoRepository.findById(videoId)
                                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại"));
                return VideoDetailResponse.builder()
                                .id(video.getId())
                                .youtubeId(video.getYoutubeId())
                                .title(video.getTitle())
                                .scriptUrl(video.getScriptUrl())
                                .status(video.getStatus())
                                .subtitles(null)
                                .build();
        }

        @Transactional
        public VideoHistoryResponse updateWatchHistory(UUID videoId, VideoHistoryRequest req, String userEmail) {
                Users user = userRepository.findByEmail(userEmail).orElseThrow(
                                () -> new UserNotFoundException("Không tìm thấy người dùng có email " + userEmail));
                Videos video = videoRepository.findById(videoId).orElseThrow(
                                () -> new ResourceNotFoundException("Không tìm thấy video có id " + videoId));

                boolean[] isNewHistory = { false };

                VideoHistory history = videoHistoryRepository.findByUser_IdAndVideo_Id(user.getId(), video.getId())
                                .map(existing -> {
                                        existing.setLastPositionSeconds(req.getLastPositionSeconds());
                                        existing.setWatchCount(existing.getWatchCount() + 1);
                                        return existing;
                                })
                                .orElseGet(() -> {
                                        isNewHistory[0] = true;
                                        return VideoHistory.builder().user(user).video(video)
                                                        .lastPositionSeconds(req.getLastPositionSeconds()).watchCount(1)
                                                        .build();
                                });
                history = videoHistoryRepository.save(history);

                if (req.getWatchedSeconds() != null && req.getWatchedSeconds() > 0) {
                        int minutesToAdd = req.getWatchedSeconds() / 60;
                        LocalDate today = LocalDate.now();
                        studyLogRepository.findByUser_IdAndDate(user.getId(), today).ifPresentOrElse(slog -> {
                                slog.setStudyMinutes(slog.getStudyMinutes() + minutesToAdd);
                                if (isNewHistory[0]) {
                                        slog.setVideosWatched(slog.getVideosWatched() + 1);
                                }
                                studyLogRepository.save(slog);
                        }, () -> studyLogRepository.save(StudyLog.builder().user(user).date(today)
                                        .studyMinutes(minutesToAdd).videosWatched(1).wordsLearned(0)
                                        .wordsReviewed(0).build()));
                }
                return VideoHistoryResponse.from(history);
        }

        @Transactional(readOnly = true)
        public List<VideoHistoryResponse> getWatchHistory(String userEmail) {
                Users user = userRepository.findByEmail(userEmail).orElseThrow(
                                () -> new UserNotFoundException("Không tìm thấy người dùng có email" + userEmail));
                return videoHistoryRepository.findByUserIdWithVideoOrderByWatchedAtDesc(user.getId()).stream()
                                .map(VideoHistoryResponse::from).toList();
        }

}
