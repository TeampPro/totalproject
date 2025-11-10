package com.example.todo_caled.chat.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private String type;        // chat, join, leave
    private String sender;
    private String message;
    private String time;
    private String roomId;      // 채팅방 구분
}
