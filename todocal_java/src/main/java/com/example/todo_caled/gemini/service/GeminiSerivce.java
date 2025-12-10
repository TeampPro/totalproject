package com.example.todo_caled.gemini.service;

import com.example.todo_caled.gemini.dto.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiSerivce {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    // 내부에서 RestClient 생성
    private final RestClient restClient = RestClient.create();

    /**
     *  query를 Gemini에 던지고, 생성된 텍스트만 문자열로 반환
     */
    public String search(String query) {
        // Gemini generateContent 요청 바디
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("arts", List.of(
                                Map.of("text", query)
                        ))
                )
        );

        GeminiResponse response = restClient.post()
                .uri(geminiApiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", apiKey)
                .body(body)
                .retrieve()
                .body(GeminiResponse.class);

        if (response == null) {
            return "Gemini 응답이 없습니다.";
        }

        String text = response.getFirstTextOrNull();
        return text != null ? text : "결과 텍스트를 찾을 수 없습니다.";
    }


}
