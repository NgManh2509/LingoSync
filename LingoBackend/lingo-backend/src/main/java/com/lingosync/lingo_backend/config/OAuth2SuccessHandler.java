package com.lingosync.lingo_backend.config;

import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import org.springframework.http.HttpHeaders;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        System.out.println("=== OAuth2SuccessHandler is called! ===");
        System.out.println("Email from Google: " + email);

        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            System.out.println("User found in DB! Generating token...");
            String token = jwtService.generateToken(user);
            ResponseCookie cookie = ResponseCookie.from("jwt_token", token)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(3600)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            try {
                System.out.println("Redirecting to frontend...");
                response.sendRedirect(frontendUrl);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }, () -> {
            System.out.println("CRITICAL ERROR: User not found in DB for email " + email);
            try {
                response.sendRedirect(frontendUrl + "?error=user_not_found");
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }
}
