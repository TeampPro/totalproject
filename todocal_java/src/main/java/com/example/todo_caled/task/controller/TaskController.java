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

    @GetMapping
    public List<Task> all() {
        return taskService.getAllTasks();
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(
            @PathVariable Long id,
            @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // 날짜별
    @GetMapping("/date/{date}")
    public List<Task> byDate(@PathVariable String date) {
        return taskService.findByDate(LocalDate.parse(date));
    }

    // 주간 스케줄표 구간 조회
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
