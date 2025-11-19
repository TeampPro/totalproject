package com.example.todo_caled.task.service;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

<<<<<<< HEAD
    public Task createTask(Task task) {
=======
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
>>>>>>> origin/login
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
        if (newData.getEndDateTime() != null) {
            t.setEndDateTime(newData.getEndDateTime());
        }

        return taskRepository.save(t);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<Task> findByDate(LocalDate date) {
        return taskRepository.findByPromiseDateBetween(
                date.atStartOfDay(),
                date.atTime(LocalTime.MAX)
        );
    }

    public List<Task> findByRange(LocalDate start, LocalDate end) {
        return taskRepository.findByPromiseDateBetween(
                start.atStartOfDay(),
                end.atTime(LocalTime.MAX)
        );
    }
}
