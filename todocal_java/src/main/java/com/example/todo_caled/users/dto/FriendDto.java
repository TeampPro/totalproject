package com.example.todo_caled.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FriendDto {
    private String id;          // 로그인 아이디
    private String name;        // 이름
    private String nickname;    // 닉네임
    private String userType;    // NORMAL / ADMIN / GUEST
    private String profileImage;
}
