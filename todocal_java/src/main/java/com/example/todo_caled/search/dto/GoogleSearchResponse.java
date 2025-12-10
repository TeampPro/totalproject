package com.example.todo_caled.search.dto;

import lombok.Data;

import java.util.List;

@Data
public class GoogleSearchResponse {

    private List<Item> items;

    @Data
    public static class Item {
        private String title;
        private String link;
        private String snippet;
    }
}
