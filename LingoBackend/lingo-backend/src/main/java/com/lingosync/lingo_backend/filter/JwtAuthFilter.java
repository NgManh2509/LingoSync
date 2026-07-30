package com.lingosync.lingo_backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.lingosync.lingo_backend.repository.UserRepository;
import com.lingosync.lingo_backend.service.JwtService;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        if(req.getCookies() != null){
            for(Cookie cookie: req.getCookies()){
                if ("jwt_token".equals(cookie.getName())){
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if(token == null){
            String authHeader = req.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token == null) {
            filterChain.doFilter(req, response);
            return;
        }

        if(jwtService.isTokenValid(token)) {
            String email = jwtService.extractEmail(token);
            userRepository.findByEmail(email).ifPresent(user -> {
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }
        filterChain.doFilter(req, response);
    }
}
