package com.example.todo_caled.comments.repository;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.comments.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByIdAsc(Post post);

}
