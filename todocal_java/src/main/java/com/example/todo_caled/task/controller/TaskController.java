package com.example.todo_caled.task.controller;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * 전체 조회
     * - 비로그인: shared = true 인 일정만
     * - 로그인(userId 있음): ownerId = userId 이거나 shared = true 인 일정만
     *
     * 프론트에서:
     *   GET /api/tasks
     *   GET /api/tasks?userId=asd1
     * 이런 식으로 호출하게 됨.
     */
    @GetMapping
<<<<<<< HEAD
<<<<<<< HEAD
    public List<Task> all() {
        return taskService.getAllTasks();
=======
    public List<Task> getAllTasks(
            @RequestParam(required = false) String userId) {
        // userId 가 없으면 공유 일정만, 있으면 "내 일정 + 공유 일정"
        return taskService.getVisibleTasks(userId);
>>>>>>> origin/login
=======
    public List<Task> all(@RequestParam(required = false) String userId) {
        List<Task> all = taskService.getAllTasks();
        return filterVisible(all, userId);
>>>>>>> origin/login
    }

    /**
     * 일정 생성
     * - promiseDate 필수
     * - endDateTime 없으면 promiseDate + 1시간 자동 설정
     * - ownerId / shared 는 바디에서 넘어오는 값 그대로 사용
     */
    @PostMapping
    public Task create(@RequestBody Task task) {

        if (task.getPromiseDate() == null) {
            throw new IllegalArgumentException("시작 시간은 필수입니다.");
        }

        // 종료시간 없으면 자동 +1시간
        if (task.getEndDateTime() == null) {
            task.setEndDateTime(task.getPromiseDate().plusHours(1));
        }

        return taskService.createTask(task);
    }

    /**
     * 일정 수정
     * - endDateTime 비었고 promiseDate 있으면 자동 +1시간
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> update(
            @PathVariable Long id,
            @RequestBody Task task
    ) {
        if (task.getPromiseDate() != null && task.getEndDateTime() == null) {
            task.setEndDateTime(task.getPromiseDate().plusHours(1));
        }

        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    /**
     * 일정 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 특정 날짜의 일정 조회
     * - 비로그인 / 로그인 모두 "보여야 하는 것만" 필터링
     *
     * 예) /api/tasks/date/2025-11-18?userId=asd1
     */
    @GetMapping("/date/{date}")
    public List<Task> byDate(
            @PathVariable String date,
            @RequestParam(required = false) String userId
    ) {
        List<Task> list = taskService.findByDate(LocalDate.parse(date));
        return filterVisible(list, userId);
    }

    /**
     * 날짜 범위로 일정 조회
     * - 비로그인 / 로그인 모두 "보여야 하는 것만" 필터링
     *
     * 예) /api/tasks/range?start=2025-11-01&end=2025-11-30&userId=asd1
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
        return filterVisible(list, userId);
    }

    /**
     * 공통 필터 로직:
     *  - userId 없음(비회원/비로그인): shared = true 인 일정만
     *  - userId 있음: ownerId = userId 이거나 shared = true 인 일정만
     */
    private List<Task> filterVisible(List<Task> all, String userId) {
        // 비로그인 → 공유 일정만
        if (userId == null || userId.isBlank()) {
            return all.stream()
                    .filter(t -> Boolean.TRUE.equals(t.getShared()))
                    .collect(Collectors.toList());
        }

        // 로그인 → 내 일정 + 공유 일정
        return all.stream()
                .filter(t ->
                        (t.getOwnerId() != null && t.getOwnerId().equals(userId)) ||
                                Boolean.TRUE.equals(t.getShared())
                )
                .collect(Collectors.toList());
    }
}
