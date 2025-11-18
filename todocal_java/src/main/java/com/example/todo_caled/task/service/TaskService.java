package com.example.todo_caled.task.service;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getVisibleTasks(String userId) {
        List<Task> all = taskRepository.findAll();

        // 로그인 안 한 경우 → 공유 일정만 노출
        if (userId == null || userId.isBlank()) {
            return all.stream()
                    .filter(t -> Boolean.TRUE.equals(t.getShared()))
                    .collect(Collectors.toList());
        }

        // 로그인(회원/비회원 공통) → 내 일정 + 공유 일정
        return all.stream()
                .filter(t ->
                        (t.getOwnerId() != null && t.getOwnerId().equals(userId)) ||
                                Boolean.TRUE.equals(t.getShared())
                )
                .collect(Collectors.toList());
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    // ✅ 수정(upsert)도 save로 처리
    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // ✅ LocalDateTime 기반 하루 구간 조회
    public List<Task> findByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end   = date.atTime(LocalTime.MAX); // 23:59:59.999999999
        return taskRepository.findByPromiseDateBetween(start, end);
    }
}
