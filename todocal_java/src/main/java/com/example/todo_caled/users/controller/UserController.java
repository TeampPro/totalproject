package com.example.todo_caled.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.todo_caled.entity.User;
import com.example.todo_caled.repository.UserRepository;

import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ 일반 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody User user) {
        Map<String, String> res = new HashMap<>();
        if (userRepository.existsById(user.getId())) {
            res.put("message", "아이디가 이미 존재합니다.");
            return ResponseEntity.badRequest().body(res);
        }

        String email = user.getEmail();
        if (email == null || !email.contains("@") || !email.endsWith(".com")) {
            res.put("message", "유효한 이메일을 입력해주세요. (예: example@email.com)");
            return ResponseEntity.badRequest().body(res);
        }

        user.setUserType("member");
        userRepository.save(user);

        res.put("message", "회원가입 성공");
        res.put("userType", "member");
        res.put("id", user.getId());
        return ResponseEntity.ok(res);
    }

    // ✅ 일반 로그인 (JSON 응답)
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User user) {
        Map<String, String> res = new HashMap<>();
        User found = userRepository.findById(user.getId());

        if (found == null) {
            res.put("message", "등록되지 않은 아이디입니다.");
            return ResponseEntity.status(400).body(res);
        }

        if (!found.getPassword().equals(user.getPassword())) {
            res.put("message", "비밀번호가 틀렸습니다.");
            return ResponseEntity.status(400).body(res);
        }

        // 일반 로그인 경로에서는 guest 접근 금지 (명확한 분리)
        if ("guest".equalsIgnoreCase(found.getUserType())) {
            res.put("message", "비회원 계정은 일반 로그인으로 접근할 수 없습니다.");
            res.put("userType", found.getUserType());
            return ResponseEntity.status(400).body(res);
        }

        res.put("message", "로그인 성공");
        res.put("userType", found.getUserType()); // 보통 "member"
        res.put("id", found.getId());
        return ResponseEntity.ok(res);
    }

    // ✅ 비회원 회원가입 (랜덤 ID/PW 생성) — JSON 반환
    @PostMapping("/belogin")
    public ResponseEntity<Map<String, String>> guestSignup() {
        String guestId = "GUEST_" + randomString(8);
        String guestPw = randomString(12);

        User guest = new User();
        guest.setId(guestId);
        guest.setPassword(guestPw);
        guest.setEmail("");
        guest.setName("");
        guest.setUserType("guest");
        userRepository.save(guest);

        Map<String, String> result = new HashMap<>();
        result.put("message", "비회원 계정이 생성되었습니다.");
        result.put("id", guestId);
        result.put("password", guestPw);
        result.put("userType", "guest");
        return ResponseEntity.ok(result);
    }

    // ✅ 비회원 로그인 체크 (이미 발급받은 ID/PW로 로그인하려는 경우)
    @PostMapping("/belogin-check")
    public ResponseEntity<Map<String, String>> guestLogin(@RequestBody User user) {
        Map<String, String> res = new HashMap<>();
        User found = userRepository.findById(user.getId());
        if (found == null || !"guest".equalsIgnoreCase(found.getUserType())) {
            res.put("message", "비회원 계정이 아닙니다.");
            return ResponseEntity.status(400).body(res);
        }

        if (!found.getPassword().equals(user.getPassword())) {
            res.put("message", "비밀번호가 틀렸습니다.");
            return ResponseEntity.status(400).body(res);
        }

        res.put("message", "비회원 로그인 성공");
        res.put("userType", "guest");
        res.put("id", found.getId());
        return ResponseEntity.ok(res);
    }

    // ✅ 전체 회원 조회 (관리용)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 랜덤 문자열 생성 유틸
    private String randomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
