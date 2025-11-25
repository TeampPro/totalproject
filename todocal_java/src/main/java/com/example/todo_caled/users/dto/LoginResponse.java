package com.example.todo_caled.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;       // JWT 토큰
    private String id;
    private String name;
    private String nickname;
    private String userType;
}
