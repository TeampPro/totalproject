package com.example.todo_caled.board.service;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.board.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    // CREATE
    public Post create(Post post) {
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // LIST by category
    public List<Post> getList(String category) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category);
    }

    // DETAIL
    public Post getPost(Long id) {
        return postRepository.findById(id).orElse(null);
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

