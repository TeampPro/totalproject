package com.example.todo_caled.task.controller;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
<<<<<<< HEAD
    public List<Task> all() {
        return taskService.getAllTasks();
=======
    public List<Task> getAllTasks(
            @RequestParam(required = false) String userId) {
        // userId 가 없으면 공유 일정만, 있으면 "내 일정 + 공유 일정"
        return taskService.getVisibleTasks(userId);
>>>>>>> origin/login
    }

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

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(
            @PathVariable Long id,
            @RequestBody Task task
    ) {
        // 종료시간 없으면 자동 +1시간
        if (task.getPromiseDate() != null && task.getEndDateTime() == null) {
            task.setEndDateTime(task.getPromiseDate().plusHours(1));
        }

        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/date/{date}")
    public List<Task> byDate(@PathVariable String date) {
        return taskService.findByDate(LocalDate.parse(date));
    }

    @GetMapping("/range")
    public List<Task> byRange(
            @RequestParam String start,
            @RequestParam String end
    ) {
        return taskService.findByRange(
                LocalDate.parse(start),
                LocalDate.parse(end)
        );
    }
}
