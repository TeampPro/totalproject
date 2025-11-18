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

        };
    }
}