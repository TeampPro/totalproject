package com.example.todo_caled.board.repository;

import com.example.todo_caled.board.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 특정 카테고리 글 리스트
    List<Post> findByCategoryOrderByCreatedAtDesc(String category);

}
