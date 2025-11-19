package com.example.todo_caled.search.controller;

import com.example.todo_caled.search.dto.SearchRequest;
import com.example.todo_caled.search.dto.SearchResponse;
import com.example.todo_caled.search.dto.SearchResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final com.example.todo_caled.search.service.GoogleSearchService googleSearchService;

    @PostMapping("/google")
    public ResponseEntity<SearchResponse> searchGoogle(@RequestBody SearchRequest request) {
        List<SearchResultDto> results = googleSearchService.search(request.getQuery());

        SearchResponse response = new SearchResponse();
        response.setQuery(request.getQuery());
        response.setResults(results);

        return ResponseEntity.ok(response);
    }

}
