package com.example.todo_caled.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.todo_caled.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findById(String id);
    boolean existsById(String id); // User 엔티티의 id 필드 기준
}
