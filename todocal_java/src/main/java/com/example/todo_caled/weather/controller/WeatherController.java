package com.example.todo_caled.weather.controller;

import com.example.todo_caled.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/multi")
    public List<Map<String, String>> getMultiWeather() throws Exception {
        return weatherService.getMultiWeather();
    }
}
