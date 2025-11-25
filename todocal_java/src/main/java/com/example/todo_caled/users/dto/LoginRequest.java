package com.example.todo_caled.users.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String id;      // 로그인 아이디
    private String password;
}
