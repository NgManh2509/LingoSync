package com.lingosync.lingo_backend.service;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import com.lingosync.lingo_backend.entity.Users;
import com.lingosync.lingo_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        String email = oidcUser.getAttribute("email");
        String name = oidcUser.getAttribute("name");
        String avatarUrl = oidcUser.getAttribute("picture");
        String googleId = oidcUser.getAttribute("sub");

        if (googleId == null) {
            googleId = oidcUser.getName();
        }

        final String finalGoogleId = googleId;
        userRepository.findByEmail(email).orElseGet(() -> {
            String uniqueUsername = name.replaceAll("\\s+", "") + "_" + finalGoogleId.substring(0, Math.min(6, finalGoogleId.length()));
            Users newUser = Users.builder()
                    .email(email)
                    .username(uniqueUsername)
                    .avatarUrl(avatarUrl)
                    .googleId(finalGoogleId)
                    .build();
            return userRepository.save(newUser);
        });

        return oidcUser;
    }

}
