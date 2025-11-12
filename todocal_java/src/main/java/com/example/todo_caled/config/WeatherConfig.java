package com.example.todo_caled.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Configuration
public class WeatherConfig {

    @Bean
    public RestTemplate weatherRestTemplate(
            @Value("${http.client.connect-timeout}") int connectTimeout,
            @Value("${http.client.read-timeout}") int readTimeout
    ) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        return new RestTemplate(factory);
    }

    @Bean
    public CaffeineCacheManager cacheManager() {
        var manager = new CaffeineCacheManager("weatherCache");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(200));
        return manager;
    }

    @Bean
    public ExecutorService weatherExecutor() {
        // 외부 API를 직렬 호출하기 위한 단일 스레드 큐
        return Executors.newSingleThreadExecutor();
    }
}
