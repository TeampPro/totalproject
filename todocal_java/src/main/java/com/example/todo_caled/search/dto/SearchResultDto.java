package com.example.todo_caled.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchResultDto {
    private String title;
    private String link;
    private String snippet;
}
