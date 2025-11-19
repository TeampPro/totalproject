package com.example.todo_caled.comments.service;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.board.repository.PostRepository;
import com.example.todo_caled.comments.dto.CommentCreateDto;
import com.example.todo_caled.comments.dto.CommentResponseDto;
import com.example.todo_caled.comments.entity.Comment;
import com.example.todo_caled.comments.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    // 댓글 목록 -> DTO로 변환
    public List<CommentResponseDto> list(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        List<Comment> comments = commentRepository.findByPostOrderByIdAsc(post);

        return comments.stream()
                .map(c -> CommentResponseDto.builder()
                        .id(c.getId())
                        .writer(c.getWriter())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .parentId(c.getParent() != null ? c.getParent().getId() : null)
                        .build()
                )
                .toList();
    }

    // 댓글/대댓글 등록
    public CommentResponseDto create(Long postId, CommentCreateDto dto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        Comment parent = null;
        if (dto.getParentId() != null) {
            parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("부모 댓글 없음"));
        }

        Comment comment = Comment.builder()
                .post(post)
                .parent(parent)
                .writer(dto.getWriter())
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Comment saved = commentRepository.save(comment);

        return CommentResponseDto.builder()
                .id(saved.getId())
                .writer(saved.getWriter())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .parentId(parent != null ? parent.getId() : null)
                .build();
    }

    // 수정
    public void update(Long id, String content) {
        Comment c = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));

        c.setContent(content);
        c.setUpdatedAt(LocalDateTime.now());
        commentRepository.save(c);
    }

    // 삭제
    public void delete(Long id) {
        commentRepository.deleteById(id);
        // 필요하면: 자식 댓글까지 같이 삭제하는 로직도 추가 가능
    }
}


