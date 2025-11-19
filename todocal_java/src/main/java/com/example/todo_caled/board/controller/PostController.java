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

    // UPDATE (작성자 검증 필요)
    @PutMapping("/{id}")
    public Post update(
            @PathVariable Long id,
            @RequestBody Post req
    ) {
        return postService.update(id, req);
    }

    // DELETE (작성자 검증 필요)
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(
            @PathVariable Long id,
            @RequestBody Map<String, String> body   // writer 받아옴
    ) {
        String writer = body.get("writer");
        boolean deleted = postService.delete(id, writer);

        return Map.of("success", deleted);
    }

    @GetMapping("/search")
    public List<Post> search(
            @RequestParam String category,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String writer,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return postService.searchFilter(category, title, writer, startDate, endDate);
    }

    @GetMapping("/{id}/prev")
    public Post getPrev(@PathVariable Long id) {
        return postService.getPrevPost(id);
    }

    @GetMapping("/{id}/next")
    public Post getNext(@PathVariable Long id) {
        return postService.getNextPost(id);
    }

}
