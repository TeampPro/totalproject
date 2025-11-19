package com.example.todo_caled.comments.dto;

import lombok.Data;

@Data
public class CommentUpdateDto {

    private String content;  // 수정할 내용
    private String writer;   // 🔥 수정 요청자 (로그인 사용자 닉네임)
}
