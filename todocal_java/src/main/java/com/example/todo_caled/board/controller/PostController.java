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
    public Post update(@PathVariable Long id, @RequestBody Post req) {
        return postService.update(id, req);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String writer = body.get("writer");
        boolean deleted = postService.delete(id, writer);

        return Map.of("success", deleted);
    }

    /** 🔍 검색 API (프론트 파라미터 기준으로 수정됨) */
    @GetMapping("/search")
    public List<Post> search(
            @RequestParam String category,
            @RequestParam(required = false) String field,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return postService.searchFilter(category, field, keyword, startDate, endDate);
    }

    /* 이전 글 */
    @GetMapping("/{id}/prev")
    public Post getPrev(@PathVariable Long id) {
        return postService.getPrevPost(id);
    }

    /* 다음 글 */
    @GetMapping("/{id}/next")
    public Post getNext(@PathVariable Long id) {
        return postService.getNextPost(id);
    }

}
