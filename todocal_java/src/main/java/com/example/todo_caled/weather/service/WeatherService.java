package com.example.todo_caled.weather.service;

import com.example.todo_caled.weather.util.GeoToGridConverter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String SERVICE_KEY;
    // ✅ 1시간 단위 초단기예보 API (하늘상태 포함)
    private final String BASE_URL =
            "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

    private final Map<String, double[]> LOCATIONS = Map.of(
            "서울", new double[]{37.5665, 126.9780},
            "부산", new double[]{35.1796, 129.0756},
            "대구", new double[]{35.8714, 128.6014},
            "광주", new double[]{35.1595, 126.8526},
            "제주", new double[]{33.4996, 126.5312},
            "김해", new double[]{35.2280, 128.8890}
    );

    public List<Map<String, String>> getMultiWeather() throws Exception {
        List<Map<String, String>> resultList = new ArrayList<>();

        // ✅ 기준시간 계산 (현재시각 - 1시간) + 30분
        LocalDateTime now = LocalDateTime.now().minusHours(1);
        String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTime = String.format("%02d30", now.getHour());

        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper mapper = new ObjectMapper();

        for (Map.Entry<String, double[]> entry : LOCATIONS.entrySet()) {
            String city = entry.getKey();
            double lat = entry.getValue()[0];
            double lon = entry.getValue()[1];

            int[] grid = GeoToGridConverter.convert(lat, lon);
            int nx = grid[0];
            int ny = grid[1];

            String url = BASE_URL
                    + "?serviceKey=" + SERVICE_KEY
                    + "&numOfRows=100&pageNo=1&dataType=JSON"
                    + "&base_date=" + baseDate
                    + "&base_time=" + baseTime
                    + "&nx=" + nx
                    + "&ny=" + ny;

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            Map<String, String> weather = new LinkedHashMap<>();
            weather.put("도시", city);
            weather.put("기준일자", baseDate);
            weather.put("기준시각", baseTime);

            for (JsonNode item : items) {
                String category = item.path("category").asText();
                String value = item.path("fcstValue").asText();

                switch (category) {
                    case "T1H" -> weather.put("기온", value + "℃");
                    case "REH" -> weather.put("습도", value + "%");
                    case "WSD" -> weather.put("풍속", value + "m/s");
                    case "PTY" -> { // 강수형태
                        Map<String, String> rainType = Map.of(
                                "0", "없음",
                                "1", "비",
                                "2", "비/눈",
                                "3", "눈",
                                "5", "빗방울",
                                "6", "빗방울/눈날림",
                                "7", "눈날림"
                        );
                        weather.put("강수형태", rainType.getOrDefault(value, "정보없음"));
                    }
                    case "SKY" -> { // 하늘상태
                        Map<String, String> skyType = Map.of(
                                "1", "맑음",
                                "3", "구름많음",
                                "4", "흐림"
                        );
                        weather.put("하늘상태", skyType.getOrDefault(value, "정보없음"));
                    }
                }
            }

            resultList.add(weather);
        }

        return resultList;
    }
}