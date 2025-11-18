package com.example.todo_caled.task.controller;


import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.service.TaskService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> getAllTasks(
            @RequestParam(required = false) String userId) {
        // userId 가 없으면 공유 일정만, 있으면 "내 일정 + 공유 일정"
        return taskService.getVisibleTasks(userId);
    }

    @GetMapping("/{id}")
    public Optional<Task> getTask(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}
