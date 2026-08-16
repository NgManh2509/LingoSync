package com.lingosync.lingo_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.AchievementResponse;
import com.lingosync.lingo_backend.dto.UserProfileResponse;
import com.lingosync.lingo_backend.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileResponse res = userService.getUserProfile(email);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<AchievementResponse>> getAchievements(Authentication authentication) {
        String email = authentication.getName();
        List<AchievementResponse> res = userService.getAchievements(email);
        return ResponseEntity.ok(res);
    }

}
