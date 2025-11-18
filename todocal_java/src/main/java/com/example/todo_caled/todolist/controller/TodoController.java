package com.example.todo_caled.todolist.controller;

import com.example.todo_caled.task.entity.Task;
import com.example.todo_caled.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TaskService taskService;

    // 전체 조회 (Calendar 하단/초기 로딩)
    @GetMapping("/all")
    public List<Task> getAllTodos(@RequestParam(required = false) String userId) { // ★ 변경
        return taskService.getVisibleTasks(userId); // ★ 변경
    }

    // 생성 (Calendar + 버튼)
    @PostMapping
    public Task createTodo(@RequestBody Task task) {
        // 프런트가 YYYY-MM-DD 만 보냈다면 promiseDate가 null일 수 있음 → 방어
        // (프런트에서 "YYYY-MM-DDT00:00:00"로 보내면 불필요)
        if (task.getPromiseDate() == null && task.getCreatedDate() != null) {
            // no-op: createdDate를 promiseDate로 쓸 생각이 없으면 제거
        }
        return taskService.saveTask(task); // ✅ 서비스 메서드명에 맞춤
    }

    // 날짜별 조회 (선택 날짜)
    @GetMapping("/{date}")
    public List<Task> getTodosByDate(@PathVariable String date) {
        return taskService.findByDate(LocalDate.parse(date));
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        taskService.deleteTask(id); // ✅ 서비스 메서드명에 맞춤
        return ResponseEntity.noContent().build();
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTodo(@PathVariable Long id, @RequestBody Task task) {
        task.setId(id);
        Task updated = taskService.updateTask(task); // ✅ 서비스 메서드명에 맞춤
        return ResponseEntity.ok(updated);
    }
}
