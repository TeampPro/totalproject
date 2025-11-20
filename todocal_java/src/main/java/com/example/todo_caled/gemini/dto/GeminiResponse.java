package com.example.todo_caled.gemini.dto;

import lombok.Data;

import java.util.List;

/**
 * Gemini generateContent 응답에서
 * candidates[0].content.parts[0].text 만 꺼내 쓰는 DTO
 */
@Data
public class GeminiResponse {

    private List<Candidate> candidates;

    @Data
    public static class Candidate {
        private Content content;
    }

    @Data
    public static class Content {
        private List<Part> parts;
    }

    @Data
    public static class Part {
        private String text;
    }

    // 편의 메서드
    public String getFirstTextOrNull() {
        if (candidates == null || candidates.isEmpty()) return null;
        Candidate c = candidates.get(0);
        if (c.getContent() == null || c.getContent().getParts() == null || c.getContent().getParts().isEmpty()) {
            return null;
        }
        return c.getContent().getParts().get(0).getText();
    }
}
