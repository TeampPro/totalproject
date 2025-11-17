package com.example.todo_caled.task.service;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    private LocalDateTime merge(LocalDate date, String time) {
        if (time == null || time.isBlank()) return date.atStartOfDay();
        return LocalDateTime.of(date, LocalTime.parse(time));
    }

    /* ===========================================
        CRUD
    ============================================ */

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task newData) {
        Task t = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        t.setTitle(newData.getTitle());
        t.setContent(newData.getContent());
        t.setLocation(newData.getLocation());
        t.setShared(newData.getShared());

        if (newData.getPromiseDate() != null) {
            t.setPromiseDate(newData.getPromiseDate());
        }

        return taskRepository.save(t);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    /* ===========================================
        날짜 조회
    ============================================ */
    public List<Task> findByDate(LocalDate date) {
        return taskRepository.findByPromiseDateBetween(
                date.atStartOfDay(),
                date.atTime(LocalTime.MAX)
        );
    }

    /* ===========================================
        구간 조회 (주간 스케줄표)
    ============================================ */
    public List<Task> findByRange(LocalDate start, LocalDate end) {
        return taskRepository.findByPromiseDateBetween(
                start.atStartOfDay(),
                end.atTime(LocalTime.MAX)
        );
    }
}
