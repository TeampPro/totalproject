package com.example.todo_caled.task.controller;


import com.example.todo_caled.task.service.KakaoLocalService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/places")
public class PlacesController {

    private final KakaoLocalService kakaoLocalService;

    public PlacesController(KakaoLocalService kakaoLocalService) {
        this.kakaoLocalService = kakaoLocalService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String searchPlaces(@RequestParam("query") String query,
                               @RequestParam(value = "page", defaultValue = "1") int page,
                               @RequestParam(value = "size", defaultValue = "10") int size) {
        return kakaoLocalService.searchKeyword(query, page, size);
    }
}
