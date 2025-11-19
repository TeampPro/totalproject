package com.example.todo_caled.board.service;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.board.repository.PostRepository;
import com.example.todo_caled.comments.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) return null;

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // DELETE
    public boolean delete(Long id) {
        if (!postRepository.existsById(id)) return false;
        postRepository.deleteById(id);
        return true;
    }
}
