package com.example.todo_caled.users.controller;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import com.example.todo_caled.users.service.KakaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.URI;            // ✅ 추가
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

    // ✅ 카카오에서 redirect_uri로 GET 요청이 들어옴
    @GetMapping("/callback")
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

            // 🔹 (참고) 여기서 세션/JWT/쿠키 등을 세팅하면
            //   프론트에서 별도 로그인 처리 없이도 인증 상태를 유지할 수 있습니다.

            // 4️⃣ React 메인 페이지로 리다이렉트
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/main"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302 Redirect

        } catch (Exception e) {
            // 에러 시에는 로그인 페이지로 돌려보내면서 에러 정보 전달 (선택사항)
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/login?error=kakao"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }
}
