package com.example.todo_caled.task.controller;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * 전체 조회
     *  - 비로그인: shared = true && 특정 친구 대상 없는(public) 일정만
     *  - 로그인(userId 있음):
     *      1) ownerId = userId
     *      2) shared = true 이면서
     *         - 특정 대상 없는(public)
     *         - 또는 TaskShare에 userId가 포함된 일정
     */
    @GetMapping
    public List<Task> all(@RequestParam(required = false) String userId) {
        List<Task> all = taskService.getAllTasks();
        return taskService.filterVisible(all, userId);
    }

    /**
     * 일정 생성
     */
    @PostMapping
    public Task create(@RequestBody Task task) {

        boolean isGuest = task.getOwnerId() != null
                && task.getOwnerId().startsWith("guest_");

        if (isGuest) {
            task.setShared(false);
        }

        if (task.getPromiseDate() == null) {
            throw new IllegalArgumentException("시작 시간은 필수입니다.");
        }

        if (task.getEndDateTime() == null) {
            task.setEndDateTime(task.getPromiseDate().plusHours(1));
        }

        return taskService.createTask(task);
    }

    /**
     * 일정 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Task task
    ) {
        Task existing = taskService.getTask(id);

        if (existing == null) {
            return ResponseEntity.status(404).body("일정 없음");
        }

        // 요청 보낸 사용자
        String requestUserId = task.getOwnerId();

        // 기존 ownerId 가 없는(예전 데이터) 경우 → 처음 수정하는 사람이 주인으로 고정
        if (existing.getOwnerId() == null) {
            existing.setOwnerId(requestUserId);
        } else {
            // 기존 ownerId 가 있는데, 요청 보낸 사람과 다르면 403
            if (requestUserId == null || !existing.getOwnerId().equals(requestUserId)) {
                return ResponseEntity.status(403).body("수정 권한이 없습니다.");
            }
        }

        // service 쪽에서 ownerId 를 바꾸지 않도록, 요청 객체도 기존 값으로 맞춰 줌
        task.setOwnerId(existing.getOwnerId());

        // 종료 시간이 없으면 자동 +1시간
        if (task.getPromiseDate() != null && task.getEndDateTime() == null) {
            task.setEndDateTime(task.getPromiseDate().plusHours(1));
        }

        return ResponseEntity.ok(taskService.updateTask(id, task));
    }


    // 일정 완료 / 해제
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> complete(
            @PathVariable Long id,
            @RequestParam String userId,
            @RequestParam(defaultValue = "true") boolean completed
    ) {
        Task existing = taskService.getTask(id);

        if (existing == null) {
            return ResponseEntity.status(404).body("일정 없음");
        }

        if (existing.getOwnerId() != null && !existing.getOwnerId().equals(userId)) {
            return ResponseEntity.status(403).body("완료 처리 권한이 없습니다.");
        }

        Task updated = taskService.updateCompleted(id, completed);
        return ResponseEntity.ok(updated);
    }

    /**
     * 일정 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestParam String userId
    ) {
        Task existing = taskService.getTask(id);

        if (existing == null) {
            return ResponseEntity.status(404).body("일정 없음");
        }

        // ownerId 가 있을 때만 권한 체크, 없으면 그냥 삭제 허용
        if (existing.getOwnerId() != null && !existing.getOwnerId().equals(userId)) {
            return ResponseEntity.status(403).body("삭제 권한이 없습니다.");
        }

        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<Task> getOne(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 특정 날짜의 일정 조회
     */
    @GetMapping("/date/{date}")
    public List<Task> byDate(
            @PathVariable String date,
            @RequestParam(required = false) String userId
    ) {
        List<Task> list = taskService.findByDate(LocalDate.parse(date));
        return taskService.filterVisible(list, userId);
    }

    /**
     * 날짜 범위로 일정 조회
     */
    @GetMapping("/range")
    public List<Task> byRange(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(required = false) String userId
    ) {
        List<Task> list = taskService.findByRange(
                LocalDate.parse(start),
                LocalDate.parse(end)
        );
        return taskService.filterVisible(list, userId);
    }
}
