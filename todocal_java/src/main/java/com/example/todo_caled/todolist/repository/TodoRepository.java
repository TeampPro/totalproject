package com.example.todo_caled.todolist.repository;

import com.example.todo_caled.todolist.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findBytDate(LocalDate tDate);
}
