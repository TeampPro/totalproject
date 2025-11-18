package com.example.todo_caled.board.controller;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.board.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private final PostService postService;

    // CREATE
    @PostMapping("/create")
    public Post create(@RequestBody Post post) {
        return postService.create(post);
    }

    // LIST by category
    @GetMapping("/list/{category}")
    public List<Post> getList(@PathVariable String category) {
        return postService.getList(category);
    }

    // DETAIL
    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        return postService.getPost(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody Post post) {
        return postService.update(id, post);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        boolean deleted = postService.delete(id);
        return Map.of("success", deleted);
    }
}
