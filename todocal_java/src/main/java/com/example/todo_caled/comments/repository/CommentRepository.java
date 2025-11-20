package com.example.todo_caled.comments.repository;

import com.example.todo_caled.board.entity.Post;
import com.example.todo_caled.comments.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByIdAsc(Post post);

    long countByPost(Post post);

    @Transactional
    @Modifying
    @Query("UPDATE Comment c SET c.writer = :newWriter " +
            "WHERE c.writer IN (:oldId, :oldName, :oldNickname)")
    void updateWriterAll(
            @Param("oldId") String oldId,
            @Param("oldName") String oldName,
            @Param("oldNickname") String oldNickname,
            @Param("newWriter") String newWriter
    );


}
