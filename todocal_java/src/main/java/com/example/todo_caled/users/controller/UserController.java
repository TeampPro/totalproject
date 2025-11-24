package com.example.todo_caled.users.controller;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import com.example.todo_caled.users.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    // 🔥 닉네임 변경 시 게시글/댓글 일괄 업데이트에 사용
    @Autowired
    private UserService userService;

    // 🔥 SecurityConfig 에서 등록한 PasswordEncoder 빈 사용
    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Path uploadRoot = Paths.get("./uploads");

    // 🔹 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody User user) {
        Map<String, String> res = new HashMap<>();

        if (userRepository.findById(user.getId()) != null) {
            res.put("message", "이미 존재하는 아이디입니다.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
        }

        // 비밀번호 BCrypt 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // userType 기본값은 엔티티에서 NORMAL 로 설정됨
        userRepository.save(user);

        res.put("message", "회원가입이 완료되었습니다.");
        return ResponseEntity.ok(res);
    }

    // 🔹 로그인 (현재는 JWT 없이 단순 검증 + 정보 반환)
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        String id = req.get("id");
        String password = req.get("password");

        User user = userRepository.findById(id);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "존재하지 않는 아이디입니다."));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "비밀번호가 올바르지 않습니다."));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("message", "로그인 성공");
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("nickname", user.getNickname());
        res.put("userType", user.getUserType());

        // 나중에 JWT 붙인다면: 여기서 토큰 만들어서 res.put("token", token) 추가

        return ResponseEntity.ok(res);
    }

    // 🔹 비회원 로그인
    @PostMapping("/belogin")
    public ResponseEntity<Map<String, String>> beLogin() {
        String guestId = "guest_" + randomString(6);
        String guestPw = randomString(8);

        User guest = new User();
        guest.setId(guestId);
        guest.setPassword(passwordEncoder.encode(guestPw));
        guest.setName("비회원");
        guest.setEmail("guest@temp.com");

        // 🔥 userType 은 대문자 GUEST 로 통일
        guest.setUserType("GUEST");

        userRepository.save(guest);

        return ResponseEntity.ok(Map.of(
                "message", "비회원 계정이 생성되었습니다.",
                "id", guestId,
                "password", guestPw
        ));
    }

    // 🔹 회원 정보 조회
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserInfo(@PathVariable String id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "존재하지 않는 사용자입니다."));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("nickname", user.getNickname());
        result.put("email", user.getEmail());
        result.put("kakaoId", user.getKakaoId());
        result.put("kakaoEmail", user.getKakaoEmail());
        result.put("userType", user.getUserType());
        result.put("profileImage", user.getProfileImage());

        return ResponseEntity.ok(result);
    }

    // 🔹 회원 정보 + 닉네임 변경 + 프로필 이미지
    @PutMapping(
            value = "/user/update-with-file",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateUserWithFile(
            @RequestParam("id") String id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "nickname", required = false) String nickname,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        try {
            User user = userRepository.findById(id);
            if (user == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("message", "해당 사용자가 존재하지 않습니다."));
            }

            // 🔐 비회원(GUEST)은 정보 수정 불가
            if ("GUEST".equalsIgnoreCase(user.getUserType())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "비회원은 정보 수정이 불가능합니다."));
            }

            // 기존 값 (게시글/댓글 작성자 업데이트용)
            String oldId = user.getId();
            String oldName = user.getName();
            String oldNickname = user.getNickname();

            // 변경 적용
            if (name != null && !name.isBlank()) user.setName(name);
            if (email != null && !email.isBlank()) user.setEmail(email);
            if (nickname != null && !nickname.isBlank()) user.setNickname(nickname);

            String savedFileName = null;
            if (profileImage != null && !profileImage.isEmpty()) {
                Files.createDirectories(uploadRoot);

                String original = Path.of(profileImage.getOriginalFilename())
                        .getFileName().toString();
                String fileName = id + "_" + System.currentTimeMillis() + "_" + original;
                Path dest = uploadRoot.resolve(fileName);

                Files.copy(profileImage.getInputStream(), dest,
                        StandardCopyOption.REPLACE_EXISTING);
                user.setProfileImage(fileName);
                savedFileName = fileName;
            }

            userRepository.save(user);

            // 🔥 닉네임이 바뀐 경우: 글/댓글 작성자 닉네임도 일괄 변경
            if (nickname != null && !nickname.equals(oldNickname)) {
                userService.updateNicknameForAll(oldId, oldName, oldNickname, nickname);
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "회원 정보가 수정되었습니다.");
            if (savedFileName != null) {
                resp.put("profileImage", savedFileName);
            }

            return ResponseEntity.ok(resp);

        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "파일 업로드 중 오류가 발생했습니다."));
        }
    }

    // 🔹 비밀번호 변경
    @PutMapping("/user/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> req
    ) {
        String id = req.get("id");
        String currentPw = req.get("currentPassword");
        String newPw = req.get("newPassword");

        User user = userRepository.findById(id);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "존재하지 않는 사용자입니다."));
        }

        // 비회원은 비밀번호 변경 불가
        if ("GUEST".equalsIgnoreCase(user.getUserType())) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "비회원은 비밀번호 변경이 불가능합니다."));
        }

        if (!passwordEncoder.matches(currentPw, user.getPassword())) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", "현재 비밀번호가 올바르지 않습니다."));
        }

        user.setPassword(passwordEncoder.encode(newPw));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
    }

    // 🔹 회원탈퇴
    @DeleteMapping("/user/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "존재하지 않는 사용자입니다."));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "회원탈퇴가 완료되었습니다."));
    }

    // 🔹 업로드된 이미지 조회
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
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 랜덤 문자열 생성 (비회원 계정용)
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
