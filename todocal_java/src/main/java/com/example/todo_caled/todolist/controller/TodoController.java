package com.example.todo_caled.todolist.controller;


import com.example.todo_caled.todolist.entity.Todo;
import com.example.todo_caled.todolist.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping("/all")
    public List<Todo> getAllTodos() {
        return todoService.getAllTodos();
    }

    @PostMapping
    public Todo createTodo(@RequestBody Todo todo) {
        return todoService.saveTodo(todo);
    }

    @GetMapping("/{date}")
    public List<Todo> getTodosByDate(@PathVariable String date) {
        return todoService.getTodosByDate(date);
    }

    @DeleteMapping("/{id}")
    public void deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(
            @PathVariable Long id,
            @RequestBody Todo todo
    ) {
        System.out.println("📩 [PUT 요청 진입]");
        System.out.println("   ├─ todoId: " + todo.getTodoId());
        System.out.println("   ├─ title: " + todo.getTitle());
        System.out.println("   ├─ content: " + todo.getContent());
        System.out.println("   ├─ tDate(raw): " + todo.getTDate());
        System.out.println("   ├─ status: " + todo.getStatus());

        // ✅ JSON 직렬화 실패 대비
        if (todo.getTDate() == null && todo.getTDateString() != null) {
            try {
                todo.setTDate(LocalDate.parse(todo.getTDateString()));
            } catch (Exception e) {
                System.out.println("⚠️ 날짜 변환 실패: " + todo.getTDateString());
            }
        }

        todo.setTodoId(id);

        Todo updated = todoService.updateTodo(todo);
        return ResponseEntity.ok(updated);
    }
}
