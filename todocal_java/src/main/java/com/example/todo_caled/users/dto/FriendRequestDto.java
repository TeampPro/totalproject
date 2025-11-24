package com.example.todo_caled.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FriendRequestDto {
    private Long requestId;     // Friendship PK
    private String fromId;      // 신청 보낸 로그인 아이디
    private String fromName;    // 이름
    private String fromNickname;
    private String fromUserType;
    private String fromProfileImage;
}
