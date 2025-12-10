package com.example.todo_caled.holiday.config;

import com.example.todo_caled.holiday.service.HolidayApiService;
import com.example.todo_caled.holiday.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class HolidayInitializer {

    private final HolidayApiService holidayApiService;
    private final HolidayRepository holidayRepository;

    @PostConstruct
    public void init() {

        int currentYear = LocalDate.now().getYear();

        // 현재 연도 공휴일 없는 경우 자동 등록
        if (holidayRepository.findByYear(currentYear).isEmpty()) {

            System.out.println("🚩 공휴일 데이터 없음 → 자동 가져오기 실행");

            // 원하는 연도 범위 넣기
            holidayApiService.fetchHolidays(currentYear - 1); // 작년
            holidayApiService.fetchHolidays(currentYear);     // 올해
            holidayApiService.fetchHolidays(currentYear + 1); // 내년

            System.out.println("✅ 공휴일 자동 등록 완료");
        }
    }
}
