package com.example.todo_caled.task.repository;

import com.example.todo_caled.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // ✅ 하루 구간 조회
    List<Task> findByPromiseDateBetween(LocalDateTime startInclusive, LocalDateTime endInclusive);
    long countByOwnerId(String ownerId);
}
