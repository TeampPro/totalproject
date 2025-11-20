package com.example.todo_caled.users.repository;

import com.example.todo_caled.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;



public interface UserRepository extends JpaRepository<User, Long> {
    User findById(String id);
    boolean existsById(String id); // User 엔티티의 id 필드 기준

    User findByKakaoId(String kakaoId);
    boolean existsByKakaoId(String kakaoId);

    @Query("SELECT u FROM User u WHERE u.userType = 'guest' AND u.createdAt < :limit")
    List<User> findGuestUsersBefore(LocalDateTime limit);


}

