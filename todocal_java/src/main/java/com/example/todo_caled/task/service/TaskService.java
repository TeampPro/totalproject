// src/main/java/com/example/todo_caled/task/service/TaskService.java
package com.example.todo_caled.task.service;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.entity.TaskShare;
import com.example.todo_caled.task.repository.TaskRepository;
import com.example.todo_caled.task.repository.TaskShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskShareRepository taskShareRepository;

    // 전체 조회
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // 생성
    public Task createTask(Task task) {
        Task saved = taskRepository.save(task);
        applyShares(saved, task.getSharedUserIds());
        return saved;
    }

    // 공유 대상 저장 로직
    private void applyShares(Task task, List<String> sharedUserIds) {
        // 공유가 아니면 무시
        if (!Boolean.TRUE.equals(task.getShared())) {
            return;
        }

        if (sharedUserIds == null || sharedUserIds.isEmpty()) {
            // 친구 선택이 하나도 없으면 "전체 공유"로 취급 → 별도 TaskShare 기록 없음
            return;
        }

        for (String uid : sharedUserIds) {
            if (uid == null || uid.isBlank()) continue;
            TaskShare share = new TaskShare(task, uid);
            taskShareRepository.save(share);
        }
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task getTask(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    // 수정 (id 기준)
    public Task updateTask(Long id, Task task) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 일정입니다. id=" + id));

        existing.setTitle(task.getTitle());
        existing.setContent(task.getContent());
        existing.setPromiseDate(task.getPromiseDate());
        existing.setEndDateTime(task.getEndDateTime());
        existing.setOwnerId(task.getOwnerId());
        existing.setShared(task.getShared());
        existing.setLocation(task.getLocation());
        existing.setCompleted(task.getCompleted());

        Task saved = taskRepository.save(existing);

        // 기존 공유 대상 삭제 후 다시 설정
        taskShareRepository.deleteByTaskId(saved.getId());
        applyShares(saved, task.getSharedUserIds());
        return saved;
    }

    // 삭제
    public void deleteTask(Long id) {
        taskShareRepository.deleteByTaskId(id);
        taskRepository.deleteById(id);
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

    // 할 일 완료 상태 변경
    public Task updateCompleted(Long id, boolean completed) {
        Task task  = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 일정입니다. id=" + id));

        task.setCompleted(completed);
        return taskRepository.save(task);
    }

    // ==========================
    // 🔥 "보여야 하는 일정" 필터 로직
    // ==========================
    public List<Task> filterVisible(List<Task> all, String userId) {
        // 관리자(admin)는 전체
        if ("admin".equals(userId)) {
            return all;
        }

        if (all == null || all.isEmpty()) return all;

        List<Long> taskIds = all.stream()
                .map(Task::getId)
                .collect(Collectors.toList());

        List<TaskShare> shareList = taskShareRepository.findByTaskIdIn(taskIds);
        Map<Long, List<TaskShare>> shareMap = shareList.stream()
                .collect(Collectors.groupingBy(ts -> ts.getTask().getId()));

        return all.stream()
                .filter(t -> isVisibleForUser(t, userId, shareMap))
                .collect(Collectors.toList());
    }

    private boolean isVisibleForUser(Task t, String userId, Map<Long, List<TaskShare>> shareMap) {
        List<TaskShare> shares = shareMap.getOrDefault(t.getId(), List.of());
        boolean hasSpecificShares = !shares.isEmpty();

        // 비로그인: 전체 공개(shared=true & 특정 친구 공유가 없는 일정)만
        if (userId == null || userId.isBlank()) {
            return Boolean.TRUE.equals(t.getShared()) && !hasSpecificShares;
        }

        // 내 일정
        if (t.getOwnerId() != null && t.getOwnerId().equals(userId)) {
            return true;
        }

        // 공유가 아니면 볼 수 없음
        if (!Boolean.TRUE.equals(t.getShared())) {
            return false;
        }

        // 공유인데 특정 공유 대상이 없는 경우 → 전체 공개
        if (!hasSpecificShares) {
            return true;
        }

        // 특정 공유 대상이 있는 경우 → 내가 그 목록에 포함될 때만
        return shares.stream().anyMatch(s -> userId.equals(s.getSharedUserId()));
    }
}
