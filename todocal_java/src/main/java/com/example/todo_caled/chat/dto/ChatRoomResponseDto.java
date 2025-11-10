package com.example.todo_caled.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ChatRoomResponseDto {
    private String id;
    private String name;
    private int participantCount;
}
