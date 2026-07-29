package com.lingosync.lingo_backend.service;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

        userRepository.findByEmail(email).orElseGet(() -> {
            String uniqueUsername = name + "_" + googleId.substring(0, 6);
            Users newUser = Users.builder()
                    .email(email)
                    .username(uniqueUsername)
                    .avatarUrl(avatarUrl)
                    .googleId(googleId)
                    .build();
            return userRepository.save(newUser);
        });

        return oAuth2User;
    }

}
