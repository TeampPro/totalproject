package com.example.todo_caled.gemini.controller;

import com.example.todo_caled.gemini.service.GeminiSerivce;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiSerivce geminiSerivce;

    @Data
    public static class SearchRequest {
        private String query;
    }

    @Data
    public static class SearchResponse {
        private String answer;
    }

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> searCh(@RequestBody SearchRequest request) {
        String answer = geminiSerivce.search(request.getQuery());

        SearchResponse response = new SearchResponse();
        response.setAnswer(answer);

        return ResponseEntity.ok(response);
    }
}
