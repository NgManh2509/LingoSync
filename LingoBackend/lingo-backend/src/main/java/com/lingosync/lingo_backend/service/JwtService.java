package com.lingosync.lingo_backend.service;

import org.springframework.stereotype.Service;

import com.lingosync.lingo_backend.entity.Users;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

import org.springframework.beans.factory.annotation.Value;
import java.util.Date;
import javax.crypto.SecretKey;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration}")
    private Long expiration;

    private SecretKey getSigninKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    private Claims extractClaims(String token) {
        return Jwts.parser().verifyWith(getSigninKey()).build().parseSignedClaims(token).getPayload();
    }

    public String generateToken(Users user) {
        return Jwts.builder().subject(user.getEmail()).claim("userId", user.getId().toString())
                .claim("username", user.getUsername()).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration)).signWith(getSigninKey()).compact();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
