package com.example.todo_caled.chat.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDto {
    private String id;
    private String name;
    private int participantCount;
}
