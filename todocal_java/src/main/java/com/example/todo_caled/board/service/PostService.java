package com.example.todo_caled.board.service;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.board.repository.PostRepository;
import com.example.todo_caled.comments.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository; // 🔥 추가

    // CREATE
    public Post create(Post post) {
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // LIST by category
    public List<Post> getList(String category) {
        List<Post> posts = postRepository.findByCategoryOrderByCreatedAtDesc(category);

        // 🔥 각 게시글에 댓글 개수 세팅
        for (Post post : posts) {
            long count = commentRepository.countByPost(post);
            post.setCommentCount(count);
        }

        return posts;
    }

    // DETAIL
    public Post getPost(Long id) {
        Post post = postRepository.findById(id).orElse(null);

        if (post != null) {
            // 🔥 상세에서도 commentCount 포함
            long count = commentRepository.countByPost(post);
            post.setCommentCount(count);
        }

        return post;
    }

    // UPDATE
    public Post update(Long id, Post req) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        // 🔥 작성자 검증
        if (!post.getWriter().equals(req.getWriter())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    // DELETE
    public boolean delete(Long id, String writer) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        // 🔥 작성자 검증
        if (!post.getWriter().equals(writer)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        postRepository.delete(post);
        return true;
    }

    public List<Post> searchFilter(
            String category,
            String title,
            String writer,
            String startDate,
            String endDate
    ) {
        LocalDateTime start = null;
        LocalDateTime end = null;

        if (startDate != null && !startDate.isEmpty()) {
            start = LocalDate.parse(startDate).atStartOfDay();
        }

        if (endDate != null && !endDate.isEmpty()) {
            end = LocalDate.parse(endDate).atTime(23, 59, 59);
        }

        return postRepository.searchFilter(category, title, writer, start, end);
    }

    public Post getPrevPost(Long id) {
        return postRepository.findTopByIdLessThanOrderByIdDesc(id);
    }

    public Post getNextPost(Long id) {
        return postRepository.findTopByIdGreaterThanOrderByIdAsc(id);
    }

}
