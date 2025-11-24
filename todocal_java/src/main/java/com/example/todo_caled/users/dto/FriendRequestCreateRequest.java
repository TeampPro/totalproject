package com.example.todo_caled.users.dto;

import lombok.Data;

@Data
public class FriendRequestCreateRequest {
    private String requesterId;  // 신청 보내는 사람 로그인 아이디
    private String receiverId;   // 신청 받는 사람 로그인 아이디
}