package com.example.todo_caled.config;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class AdminInitConfig {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            // id 컬럼 기준으로 admin 유저가 이미 있는지 확인
            User existing = userRepository.findById("admin");
            if (existing != null) {
                return; // 이미 있으면 아무것도 안 함
            }

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            User admin = new User();
            admin.setId("admin");                         // ★ 아이디
            admin.setPassword(encoder.encode("admin"));   // ★ 비밀번호(admin) 암호화
            admin.setName("관리자");                       // ★ 직책/이름
            admin.setEmail("admin@example.com");
            admin.setUserType("ADMIN");                   // ★ 관리자 구분

            userRepository.save(admin);
            System.out.println("✅ 기본 관리자 계정 생성 완료 (id=admin / pw=admin)");
        };
    }
}
