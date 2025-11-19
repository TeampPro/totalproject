package com.example.todo_caled.task.service;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

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

<<<<<<< HEAD
<<<<<<< HEAD
=======
    // 생성
>>>>>>> origin/login
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
