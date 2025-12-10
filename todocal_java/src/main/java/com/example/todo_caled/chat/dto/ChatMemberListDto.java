package com.example.todo_caled.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChatMemberListDto {
    private String roomId;
    private List<String> members;
    private boolean systemMessage;  // 프론트에서 구분
}
