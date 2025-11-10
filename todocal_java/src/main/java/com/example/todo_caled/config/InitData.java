package com.example.todo_caled.config;


import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class InitData {

    @Bean
    CommandLineRunner initDatabase(TaskRepository taskRepository) {
        return args -> {
            taskRepository.save(new Task("팀 프로젝트 기획 회의", "회의실 A에서 오전 10시에 진행", LocalDateTime.of(2025, 11, 5, 10, 0)));
            taskRepository.save(new Task("React API 연동", "프론트엔드에서 POST 요청 테스트", LocalDateTime.of(2025, 11, 6, 15, 30)));
            taskRepository.save(new Task("DB 검증 및 리포트 작성", "MariaDB 데이터 검증 후 결과 보고서 작성", LocalDateTime.of(2025, 11, 7, 9, 0)));

            System.out.println("✅ 초기 데이터 3개 삽입 완료!");
        };
    }
}