package com.example.todo_caled.holiday.controller;


import com.example.todo_caled.holiday.entity.Holiday;
import com.example.todo_caled.holiday.service.HolidayApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayApiService apiService;

    @PostMapping("/{year}")
    public List<Holiday> save(@PathVariable int year) {
        return apiService.fetchHolidays(year);
    }

    // 조회
    @GetMapping("/{year}")
    public List<Holiday> getHolidays(@PathVariable int year) {
        return apiService.getHolidays(year);
    }

    @PostMapping("/init")
    public String initHolidays() {
        apiService.fetchHolidays(2025);
        apiService.fetchHolidays(2026);
        apiService.fetchHolidays(2027);
        return "✅ Holidays imported for 2025~2027";
    }

}
