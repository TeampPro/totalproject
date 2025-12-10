package com.example.todo_caled.comments.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponseDto {
    private Long id;
    private String writer;
    private String content;
    private LocalDateTime createdAt;
    private Long parentId;  // 🔥 부모 댓글 id (없으면 null)
}
