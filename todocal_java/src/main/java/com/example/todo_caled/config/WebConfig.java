package com.example.todo_caled.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 모든 경로 허용
                .allowedOriginPatterns("*") // 모든 도메인 허용
                .allowedMethods("*") // GET, POST, PUT, DELETE, OPTIONS 전부 허용
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(false) // 쿠키 필요 없으면 false
                .maxAge(3600);
    }
}
