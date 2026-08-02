package com.lingosync.lingo_backend.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String mes) {
        super(mes);
    }

}
