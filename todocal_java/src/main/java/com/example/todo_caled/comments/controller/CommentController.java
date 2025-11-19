package com.example.todo_caled.comments.controller;

import com.example.todo_caled.comments.dto.CommentCreateDto;
import com.example.todo_caled.comments.dto.CommentResponseDto;
import com.example.todo_caled.comments.dto.CommentUpdateDto;
import com.example.todo_caled.comments.entity.Comment;
import com.example.todo_caled.comments.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // 목록
    @GetMapping("/{postId}")
    public List<CommentResponseDto> list(@PathVariable Long postId) {
        return commentService.list(postId);
    }

    // 등록 (댓글 + 대댓글)
    @PostMapping("/{postId}")
    public CommentResponseDto save(@PathVariable Long postId,
                                   @RequestBody CommentCreateDto dto) {
        return commentService.create(postId, dto);
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id,
                                       @RequestBody CommentUpdateDto dto) {
        commentService.update(id, dto.getContent());
        return ResponseEntity.ok().build();
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.ok().build();
    }
}

