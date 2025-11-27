package com.example.todo_caled.users.controller;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import com.example.todo_caled.users.service.KakaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/kakao")
public class KakaoController {

    @Autowired
    private KakaoService kakaoService;

    @Autowired
    private UserRepository userRepository;

    // ✅ 카카오에서 redirect_uri 로 GET 요청이 들어오는 콜백
    @GetMapping("/callback")
    public ResponseEntity<?> kakaoLogin(@RequestParam("code") String code) {
        try {
            // 1️⃣ 인가코드로 Access Token 받기
            String accessToken = kakaoService.getAccessToken(code);

            // 2️⃣ Access Token 으로 사용자 정보 조회
            Map<String, Object> kakaoUser = kakaoService.getUserInfo(accessToken);

            String kakaoId = kakaoUser.get("id").toString();
            String kakaoEmail = (String) kakaoUser.get("email");
            String kakaoName = (String) kakaoUser.get("nickname");

            // 3️⃣ DB 에 존재하는지 확인
            User existingUser = userRepository.findByKakaoId(kakaoId);
            if (existingUser == null) {
                // 신규 사용자면 자동 회원가입
                User newUser = new User();
                newUser.setKakaoId(kakaoId);
                newUser.setKakaoEmail(kakaoEmail);
                newUser.setName(kakaoName);
                newUser.setUserType("KAKAO");
                newUser.setId("kakao_" + kakaoId);           // 내부 로그인 아이디
                newUser.setPassword("kakao_login_user");     // 더미 비밀번호

                userRepository.save(newUser);
                existingUser = newUser;
            }

            // 4️⃣ React 카카오 콜백 페이지로 리다이렉트 (우리 로그인 ID 전달)
            String loginId = existingUser.getId(); // 예: kakao_xxxxx

            HttpHeaders headers = new HttpHeaders();
            String redirectUrl =
                    "http://localhost:5173/auth/kakao/success?id=" + loginId;
            headers.setLocation(URI.create(redirectUrl));

            return new ResponseEntity<>(headers, HttpStatus.FOUND);

        } catch (Exception e) {
            // 에러 시 로그인 페이지로 돌려보내기
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/login?error=kakao"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }
}
