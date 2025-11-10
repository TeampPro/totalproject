package com.example.todo_caled.task.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;

@Service
public class KakaoLocalService {

    private final RestTemplate restTemplate;

    @Value("${kakao.rest.key}")
    private String kakaoRestKey;

    public KakaoLocalService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String searchKeyword(String query, int page, int size) {
        String url = "https://dapi.kakao.com/v2/local/search/keyword.json";

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("query", query)
                .queryParam("page", page)
                .queryParam("size", size);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                String.class
        );

        return response.getBody();
    }
}
