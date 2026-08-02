package com.lingosync.lingo_backend.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.lingosync.lingo_backend.dto.ProcessVideoRequest;
import com.lingosync.lingo_backend.dto.VideoDetailResponse;
import com.lingosync.lingo_backend.dto.WorkerRequest;
import com.lingosync.lingo_backend.dto.WorkerResponse;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.entity.Videos;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.exception.WorkerApiException;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.repository.VideoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VideoService {
        private final VideoRepository videoRepository;
        private final UserRepository userRepository;
        private final RestClient restClient;

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

                        savedVideo.setStatus("READY");
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

}
