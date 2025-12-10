package com.example.todo_caled.search.dto;

import lombok.Data;

import java.util.List;

@Data
public class SearchResponse {

        private String query;
        private List<SearchResultDto> results;
}
