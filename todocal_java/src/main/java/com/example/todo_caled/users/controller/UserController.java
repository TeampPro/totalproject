package com.example.todo_caled.users.controller;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private final Path uploadRoot = Paths.get("./uploads");
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ 회원가입 (비밀번호 암호화)
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody User user) {
        Map<String, String> res = new HashMap<>();

        if (userRepository.findById(user.getId()) != null) {
            res.put("message", "이미 존재하는 아이디입니다.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
        }

        // 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPw);

        userRepository.save(user);
        res.put("message", "회원가입이 완료되었습니다.");
        return ResponseEntity.ok(res);
    }

    // ✅ 로그인 (암호화된 비밀번호 비교)
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> req) {
        String id = req.get("id");
        String password = req.get("password");

        Map<String, String> res = new HashMap<>();
        User user = userRepository.findById(id);

        if (user == null) {
            res.put("message", "존재하지 않는 아이디입니다.");
            return ResponseEntity.status(404).body(res);
        }

        // 암호화된 비밀번호 비교
        if (!passwordEncoder.matches(password, user.getPassword())) {
            res.put("message", "비밀번호가 올바르지 않습니다.");
            return ResponseEntity.status(401).body(res);
        }

        res.put("message", "로그인 성공");
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("userType", user.getUserType());
        return ResponseEntity.ok(res);
    }

    // ✅ 비회원 로그인 (암호화 X)
    @PostMapping("/belogin")
    public ResponseEntity<Map<String, String>> beLogin() {
        Map<String, String> res = new HashMap<>();
        String guestId = "guest_" + randomString(6);
        String guestPw = randomString(8);

        User guest = new User();
        guest.setId(guestId);
        guest.setPassword(passwordEncoder.encode(guestPw)); // 암호화 저장
        guest.setName("비회원");
        guest.setEmail("guest@temp.com");
        guest.setUserType("guest");

        userRepository.save(guest);

        res.put("message", "비회원 계정이 생성되었습니다.");
        res.put("id", guestId);
        res.put("password", guestPw); // 원본 비밀번호는 응답에 포함 (로그인용)
        return ResponseEntity.ok(res);
    }

    // ✅ 회원 정보 조회
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserInfo(@PathVariable String id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "존재하지 않는 사용자입니다."));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        result.put("kakaoId", user.getKakaoId());
        result.put("kakaoEmail", user.getKakaoEmail());
        result.put("userType", user.getUserType());
        result.put("profileImage", user.getProfileImage());

        return ResponseEntity.ok(result);
    }

    // ✅ 회원 정보 수정 (프로필 이미지 포함)
    @PutMapping(value = "/user/update-with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserWithFile(
            @RequestParam("id") String id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        try {
            User user = userRepository.findById(id);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("message", "해당 사용자가 존재하지 않습니다."));
            }
            if ("guest".equalsIgnoreCase(user.getUserType())) {
                return ResponseEntity.status(403).body(Map.of("message", "비회원은 정보 수정이 불가능합니다."));
            }

            if (name != null && !name.isBlank()) user.setName(name);
            if (email != null && !email.isBlank()) user.setEmail(email);

            String savedFileName = null;
            if (profileImage != null && !profileImage.isEmpty()) {
                Files.createDirectories(uploadRoot);
                String original = Path.of(profileImage.getOriginalFilename()).getFileName().toString();
                String fileName = id + "_" + System.currentTimeMillis() + "_" + original;
                Path dest = uploadRoot.resolve(fileName);
                Files.copy(profileImage.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
                user.setProfileImage(fileName);
                savedFileName = fileName;
            }

            userRepository.save(user);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "회원 정보가 수정되었습니다.");
            if (savedFileName != null) resp.put("profileImage", savedFileName);

            return ResponseEntity.ok(resp);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "파일 업로드 중 오류가 발생했습니다."));
        }
    }

    // ✅ 비밀번호 변경 (BCrypt 반영)
    @PutMapping("/user/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> req) {
        String id = req.get("id");
        String currentPw = req.get("currentPassword");
        String newPw = req.get("newPassword");
        Map<String, String> res = new HashMap<>();

        User user = userRepository.findById(id);
        if (user == null) {
            res.put("message", "존재하지 않는 사용자입니다.");
            return ResponseEntity.status(404).body(res);
        }

        if ("guest".equalsIgnoreCase(user.getUserType())) {
            res.put("message", "비회원은 비밀번호 변경이 불가능합니다.");
            return ResponseEntity.status(403).body(res);
        }

        // 현재 비밀번호 검증
        if (!passwordEncoder.matches(currentPw, user.getPassword())) {
            res.put("message", "현재 비밀번호가 올바르지 않습니다.");
            return ResponseEntity.status(400).body(res);
        }

        // 새 비밀번호 암호화 후 저장
        user.setPassword(passwordEncoder.encode(newPw));
        userRepository.save(user);
        res.put("message", "비밀번호가 성공적으로 변경되었습니다.");
        return ResponseEntity.ok(res);
    }

    // ✅ 회원탈퇴
    @DeleteMapping("/user/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        Map<String, String> res = new HashMap<>();
        User user = userRepository.findById(id);
        if (user == null) {
            res.put("message", "존재하지 않는 사용자입니다.");
            return ResponseEntity.status(404).body(res);
        }

        userRepository.delete(user);
        res.put("message", "회원탈퇴가 완료되었습니다.");
        return ResponseEntity.ok(res);
    }

    // ✅ 업로드된 이미지 조회
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveUpload(@PathVariable String filename) {
        try {
            Path file = uploadRoot.resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(file);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ 랜덤 문자열 생성 유틸
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
