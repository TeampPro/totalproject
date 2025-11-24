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
     *  - GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<AdminUserDto> result = users.stream()
                .map(u -> {
                    String loginId = u.getId();           // 로그인용 아이디
                    String name = u.getName();
                    String nickname = u.getNickname();    // 🔥 실제 닉네임 사용
                    String userType = u.getUserType();    // NORMAL / GUEST / ADMIN / KAKAO 등
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
     *  - GET /api/admin/users/{id}
     *  - {id} 는 로그인 아이디(User.id)
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> getUserByLoginId(@PathVariable("id") String loginId) {
        User user = userRepository.findById(loginId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String name = user.getName();
        String nickname = user.getNickname();     // 🔥 닉네임 사용
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
     *  - PUT /api/admin/users/{id}
     *  - Body: AdminUserUpdateRequest
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

        // 🔥 닉네임 수정
        if (request.getNickname() != null && !request.getNickname().isBlank()) {
            user.setNickname(request.getNickname());
        }

        // 직책/권한(userType) 수정
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
                user.getNickname(),
                user.getUserType(),
                activityCount
        );

        return ResponseEntity.ok(dto);
    }

    /**
     * ✅ 회원 탈퇴 (로그인 아이디 기준)
     *  - DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUserByLoginId(@PathVariable("id") String loginId) {
        User user = userRepository.findById(loginId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
