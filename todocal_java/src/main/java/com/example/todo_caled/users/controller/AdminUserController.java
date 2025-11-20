package com.example.todo_caled.users.controller;

import com.example.todo_caled.task.repository.TaskRepository;
import com.example.todo_caled.users.dto.AdminUserDto;
import com.example.todo_caled.users.dto.AdminUserUpdateRequest;
import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository,
                               TaskRepository taskRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * ✅ 전체 회원 조회 + 활동내역(일정 수)
     *  프론트: GET http://localhost:8080/api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<AdminUserDto> result = users.stream()
                .map(u -> {
                    // 🔹 User 엔티티 기준
                    //  - PK: userId (Long, 지금은 안 씀)
                    //  - 로그인 아이디: id (String)  ← Task.ownerId에도 이 값이 들어감
                    String loginId = u.getId();        // 로그인용 아이디 (예: dd)
                    String name = u.getName();         // 이름

                    // 🔹 닉네임은 당장 엔티티에 없을 수도 있으니 안전하게 처리
                    //  - 나중에 User 엔티티에 nickname 필드 만들면 여기만 고치면 됨
                    String nickname = "";              // 일단 빈 문자열로 내려보냄
                    // 만약 User에 getNickName() 이라는 메서드가 있으면:
                    // String nickname = u.getNickName();

                    String userType = u.getUserType(); // NORMAL / GUEST / ADMIN 등

                    // 🔹 일정 개수 = tasks.ownerId = 로그인 아이디 기준 카운트
                    long activityCount = taskRepository.countByOwnerId(loginId);

                    return new AdminUserDto(
                            loginId,
                            name,
                            nickname,
                            userType,
                            activityCount
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
    /**
     * ✅ 단일 회원 조회
     *  프론트: GET http://localhost:8080/api/admin/users/{id}
     *  - {id} 는 로그인 아이디(User.id)
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> getUserByLoginId(@PathVariable("id") String loginId) {
        User user = userRepository.findById(loginId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String name = user.getName();
        String nickname = ""; // 닉네임 필드가 생기면 user.getNickname() 으로 변경
        String userType = user.getUserType();
        long activityCount = taskRepository.countByOwnerId(loginId);

        AdminUserDto dto = new AdminUserDto(
                loginId,
                name,
                nickname,
                userType,
                activityCount
        );

        return ResponseEntity.ok(dto);
    }

    /**
     * ✅ 회원 정보 수정 + (선택) 비밀번호 재설정
     *  프론트: PUT http://localhost:8080/api/admin/users/{id}
     *  Body: AdminUserUpdateRequest
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable("id") String loginId,
            @RequestBody AdminUserUpdateRequest request
    ) {
        User user = userRepository.findById(loginId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // 이름 수정
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        // 닉네임은 현재 User 엔티티에 필드가 없다고 가정 → 일단 무시
        // 나중에 User 에 nickname 필드가 생기면:
        // if (request.getNickname() != null) { user.setNickname(request.getNickname()); }

        // 직책/권한 수정
        if (request.getUserType() != null && !request.getUserType().isBlank()) {
            user.setUserType(request.getUserType());
        }

        // 새 비밀번호가 들어온 경우에만 재설정
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            String encoded = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(encoded);
        }

        userRepository.save(user);

        long activityCount = taskRepository.countByOwnerId(loginId);
        AdminUserDto dto = new AdminUserDto(
                user.getId(),
                user.getName(),
                "", // 닉네임은 아직 없음
                user.getUserType(),
                activityCount
        );

        return ResponseEntity.ok(dto);
    }


    /**
     * ✅ 회원 탈퇴 (로그인 아이디 기준)
     *  프론트: DELETE http://localhost:8080/api/admin/users/{id}
     *  - {id} 자리에 로그인 아이디(User.id)가 들어온다고 가정
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUserByLoginId(@PathVariable("id") String loginId) {

        // UserRepository 에 이미 String id 버전 findById 정의돼 있는 구조 기준
        User user = userRepository.findById(loginId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
