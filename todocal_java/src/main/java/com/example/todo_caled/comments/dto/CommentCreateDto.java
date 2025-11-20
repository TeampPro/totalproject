package com.example.todo_caled.comments.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CommentCreateDto {
    private String writer;
    private String content;
    private Long parentId;
}