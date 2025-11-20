package com.example.todo_caled.search.service;

import com.example.todo_caled.search.dto.GoogleSearchResponse;
import com.example.todo_caled.search.dto.SearchResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoogleSearchService {

    @Value("${google.search.api.url}")
    private String apiUrl;

    @Value("${google.search.api.key}")
    private String apiKey;

    @Value("${google.search.cx}")
    private String cx;

    private final RestClient restClient = RestClient.create();

    public List<SearchResultDto> search(String query) {
        // 1️⃣ 필수 값 체크 (키 / cx 없으면 500 대신 로그만 찍고 빈 리스트 반환)
        if (apiKey == null || apiKey.isBlank() ||
                cx == null || cx.isBlank()) {

            log.error("Google Search API 설정이 비어 있습니다. apiKey={}, cx={}", apiKey, cx);
            return Collections.emptyList();
        }

        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(apiUrl)
                    .queryParam("key", apiKey)
                    .queryParam("cx", cx)
                    .queryParam("q", query)
                    .encode()
                    .build()
                    .toUri();

            log.info("Calling Google Custom Search API: {}", uri);

            GoogleSearchResponse response = restClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(GoogleSearchResponse.class);

            if (response == null || response.getItems() == null) {
                log.warn("Google Search 응답이 비어 있습니다.");
                return Collections.emptyList();
            }

            return response.getItems().stream()
                    .map(item -> new SearchResultDto(
                            item.getTitle(),
                            item.getLink(),
                            item.getSnippet()
                    ))
                    .collect(Collectors.toList());

        } catch (RestClientException e) {
            // 2️⃣ 외부 API 에러를 콘솔에 자세히 찍고, 500 대신 빈 리스트 반환
            log.error("Google Search API 호출 중 오류 발생", e);
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Google Search 처리 중 알 수 없는 오류 발생", e);
            return Collections.emptyList();
        }
    }
}
