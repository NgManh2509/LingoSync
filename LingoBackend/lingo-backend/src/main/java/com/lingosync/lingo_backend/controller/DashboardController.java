package com.lingosync.lingo_backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lingosync.lingo_backend.dto.DashboardStatsResponse;
import com.lingosync.lingo_backend.dto.StudyLogResponse;
import com.lingosync.lingo_backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication authentication) {
        String email = authentication.getName();
        DashboardStatsResponse res = dashboardService.getStats(email);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/study-logs")
    public ResponseEntity<List<StudyLogResponse>> getStudyLogs(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "week") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        String email = authentication.getName();
        List<StudyLogResponse> res = dashboardService.getStudyLogs(email, range, from, to);
        return ResponseEntity.ok(res);
    }

}
