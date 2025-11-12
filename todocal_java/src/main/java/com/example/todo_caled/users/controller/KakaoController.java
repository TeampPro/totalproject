package com.example.todo_caled.users.controller;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import com.example.todo_caled.users.service.KakaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/kakao")
public class KakaoController {

    @Autowired
    private KakaoService kakaoService;

    @Autowired
    private UserRepository userRepository;

    // ✅ 프론트에서 인가코드(code) 받으면 여기로 POST
    @PostMapping("/callback")
    public ResponseEntity<?> kakaoLogin(@RequestParam("code") String code) {
        try {
            // 1️⃣ 인가코드로 Access Token 받기
            String accessToken = kakaoService.getAccessToken(code);

            // 2️⃣ Access Token으로 사용자 정보 조회
            Map<String, Object> kakaoUser = kakaoService.getUserInfo(accessToken);

            String kakaoId = kakaoUser.get("id").toString();
            String kakaoEmail = (String) kakaoUser.get("email");
            String kakaoName = (String) kakaoUser.get("nickname");

            // 3️⃣ DB에 존재하는지 확인
            User existingUser = userRepository.findByKakaoId(kakaoId);
            if (existingUser == null) {
                // 신규 사용자면 자동 회원가입
                User newUser = new User();
                newUser.setKakaoId(kakaoId);
                newUser.setKakaoEmail(kakaoEmail);
                newUser.setName(kakaoName);
                newUser.setUserType("KAKAO");
                newUser.setId("kakao_" + kakaoId); // 내부 아이디 자동 생성
                newUser.setPassword("kakao_login_user"); // 비밀번호 dummy

                userRepository.save(newUser);
                existingUser = newUser;
            }

            // 4️⃣ 응답
            Map<String, Object> res = new HashMap<>();
            res.put("message", "카카오 로그인 성공");
            res.put("id", existingUser.getId());
            res.put("name", existingUser.getName());
            res.put("email", existingUser.getKakaoEmail());
            res.put("userType", existingUser.getUserType());

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "카카오 로그인 중 오류 발생", "error", e.getMessage()));
        }
    }
}
