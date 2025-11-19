package com.example.todo_caled.task.service;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    // 전체 조회
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // 생성
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // 수정 (id 기준)
    public Task updateTask(Long id, Task task) {
        // 필요한 경우 기존 엔티티 조회 후 필드만 갱신해도 되고,
        // 여기서는 단순히 id만 세팅해서 upsert 처리
        task.setId(id);
        return taskRepository.save(task);
    }

    // 삭제
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // 단일 조회 (필요하면 사용)
    public Task getTask(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    // 특정 날짜의 일정
    public List<Task> findByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end   = date.atTime(LocalTime.MAX);
        return taskRepository.findByPromiseDateBetween(start, end);
    }

    // 날짜 범위의 일정
    public List<Task> findByRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end   = endDate.atTime(LocalTime.MAX);
        return taskRepository.findByPromiseDateBetween(start, end);
    }
}
