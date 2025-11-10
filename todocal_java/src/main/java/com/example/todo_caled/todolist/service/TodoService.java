package com.example.todo_caled.todolist.service;


import com.example.todo_caled.todolist.entity.Todo;
import com.example.todo_caled.todolist.repository.TodoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    public Todo saveTodo(Todo todo) {
        if (todo.getTDate() == null) todo.setTDate(LocalDate.now());
        if (todo.getSCheck() == null) todo.setSCheck(false);
        if (todo.getStatus() == null || todo.getStatus().isBlank()) todo.setStatus("ACTIVE");
        if (todo.getOwnerId() == null) todo.setOwnerId(1L);
        if (todo.getCalendarId() == null) todo.setCalendarId(1L);

        return todoRepository.save(todo);
    }

    public List<Todo> getTodosByDate(String date) {
        LocalDate localDate = LocalDate.parse(date);
        return todoRepository.findBytDate(localDate);
    }

    @Transactional
    public Todo updateTodo(Todo todo) {
        Todo existing = todoRepository.findById(todo.getTodoId())
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        System.out.println("🧩 Before Update: " + existing.getTDate());
        System.out.println("🧩 Incoming: " + todo.getTDate());

        existing.setTitle(todo.getTitle());
        existing.setContent(todo.getContent());
        existing.setStatus(todo.getStatus());
        existing.setTDate(todo.getTDate());

        Todo saved = todoRepository.saveAndFlush(existing);
        System.out.println("✅ After Update: " + saved.getTDate());

        return saved;
    }

    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new RuntimeException("❌ Todo not found with id " + id);
        }
        todoRepository.deleteById(id);
    }
}
