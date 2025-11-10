package com.example.todo_caled.holiday.service;


import com.example.todo_caled.holiday.entity.Holiday;
import com.example.todo_caled.holiday.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.*;


import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HolidayApiService {

    private final HolidayRepository holidayRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${holiday.api.key}")
    private String apiKey;

    public List<Holiday> getHolidays(int year) {
        return holidayRepository.findByYear(year);
    }

    public List<Holiday> fetchHolidays(int year) {
        String url = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo"
                + "?serviceKey=" + apiKey
                + "&solYear=" + year
                + "&numOfRows=100"
                + "&_type=json";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        JSONObject jsonObj = new JSONObject(response.getBody())
                .getJSONObject("response")
                .getJSONObject("body")
                .getJSONObject("items");

        List<Holiday> result = new ArrayList<>();

        JSONArray arr = jsonObj.getJSONArray("item");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.getJSONObject(i);

            Holiday holiday = new Holiday();
            holiday.setName(obj.getString("dateName"));

            String locdate = String.valueOf(obj.get("locdate"));
            holiday.setDate(LocalDate.parse(locdate, formatter));

            holidayRepository.save(holiday);
            result.add(holiday);
        }

        return result;

    }
}
