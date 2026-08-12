package com.lingosync.lingo_backend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lingosync.lingo_backend.dto.CreatePlaylistRequest;
import com.lingosync.lingo_backend.dto.PlaylistDetailResponse;
import com.lingosync.lingo_backend.dto.PlaylistSummaryResponse;
import com.lingosync.lingo_backend.dto.PlaylistVideoItemResponse;
import com.lingosync.lingo_backend.dto.UpdatePlaylistRequest;
import com.lingosync.lingo_backend.entity.Playlist;
import com.lingosync.lingo_backend.entity.PlaylistVideo;
import com.lingosync.lingo_backend.entity.PlaylistVideoId;
import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.entity.Videos;
import com.lingosync.lingo_backend.exception.ConflictException;
import com.lingosync.lingo_backend.exception.ResourceNotFoundException;
import com.lingosync.lingo_backend.exception.UserNotFoundException;
import com.lingosync.lingo_backend.repository.PlaylistRepository;
import com.lingosync.lingo_backend.repository.PlaylistVideoRepository;
import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.repository.VideoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final UserRepository userRepository;
    private final PlaylistRepository playlistRepository;
    private final PlaylistVideoRepository playlistVideoRepository;
    private final VideoRepository videoRepository;

    private Users findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("Khong tim thay user"));
    }

    @Transactional(readOnly = true)
    public List<PlaylistSummaryResponse> getUserPlaylists(String userEmail) {
        Users user = findByEmail(userEmail);
        List<Playlist> playlists = playlistRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        return playlists.stream().map(
                playlist -> {
                    int totalVideos = playlistVideoRepository.countById_PlaylistId(playlist.getId());
                    return PlaylistSummaryResponse.from(playlist, totalVideos);
                }).collect(Collectors.toList());
    }

    @Transactional
    public PlaylistSummaryResponse createPlaylist(String userEmail, CreatePlaylistRequest req) {
        Users user = findByEmail(userEmail);
        if (playlistRepository.findByUser_IdAndName(user.getId(), req.getName()).isPresent()) {
            throw new ConflictException("Playlist '" + req.getName() + "' đã tồn tại");
        }
        Playlist playlist = Playlist.builder()
                .user(user)
                .name(req.getName())
                .description(req.getDescription())
                .build();
        Playlist savedPlaylist = playlistRepository.save(playlist);

        return PlaylistSummaryResponse.from(savedPlaylist, 0);
    }

    @Transactional(readOnly = true)
    public PlaylistDetailResponse getPlaylistDetail(String userEmail, UUID playlistId) {
        Users user = findByEmail(userEmail);
        Playlist playlist = playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy playlist có ID : " + playlistId));

        List<PlaylistVideo> playlistVideos = playlistVideoRepository
                .findByPlaylistIdWithVideoOrderByPositionAsc(playlistId);

        List<PlaylistVideoItemResponse> videoItems = playlistVideos.stream().map(PlaylistVideoItemResponse::from)
                .collect(Collectors.toList());
        return PlaylistDetailResponse.from(playlist, videoItems);
    }

    @Transactional
    public PlaylistSummaryResponse updatePlaylist(String userEmail, UUID playlistId, UpdatePlaylistRequest req) {
        Users user = findByEmail(userEmail);
        Playlist playlist = playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy playlist"));

        playlistRepository.findByUser_IdAndName(user.getId(), req.getName())
                .filter(existing -> !existing.getId().equals(playlistId)).ifPresent(existing -> {
                    throw new ConflictException("Playlist '" + req.getName() + "' đã tồn tại");
                });

        playlist.setName(req.getName());
        playlist.setDescription(req.getDescription());
        playlistRepository.save(playlist);

        int totalVideos = playlistVideoRepository.countById_PlaylistId(playlistId);
        return PlaylistSummaryResponse.from(playlist, totalVideos);
    }

    @Transactional
    public void deletePlaylist(String userEmail, UUID playlistId) {
        Users user = findByEmail(userEmail);
        Playlist playlist = playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy playlist ID : " + playlistId));
        playlistRepository.delete(playlist);
    }

    @Transactional
    public PlaylistVideoItemResponse addVideoToPlaylist(String userEmail, UUID playlistId, UUID videoId) {
        Users user = findByEmail(userEmail);
        Playlist playlist = playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy playlist có ID : " + playlistId));
        Videos video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy video có ID : " + videoId));
        if (playlistVideoRepository.existsById_PlaylistIdAndId_VideoId(playlistId, videoId)) {
            throw new ConflictException("Video đã có trong playlist");
        }

        int nextPosition = playlistVideoRepository.findMaxPositionByPlaylistId(playlistId) + 1;

        PlaylistVideo playlistVideo = PlaylistVideo.builder().id(new PlaylistVideoId(playlistId, videoId))
                .playlist(playlist).video(video).position(nextPosition).build();
        PlaylistVideo saved = playlistVideoRepository.save(playlistVideo);
        return PlaylistVideoItemResponse.from(saved);
    }

    @Transactional
    public void removeVideoFromPlaylist(String userEmail, UUID playlistId, UUID videoId) {
        Users user = findByEmail(userEmail);
        playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy playlist có ID: " + playlistId));

        if (!playlistVideoRepository.existsById_PlaylistIdAndId_VideoId(playlistId, videoId)) {
            throw new ResourceNotFoundException("Video không có trong playlist");
        }

        playlistVideoRepository.deleteById_PlaylistIdAndId_VideoId(playlistId, videoId);

    }

}
