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

    /** 닉네임 변경 시 댓글 writer 전체 교체 */
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

    /** 게시글의 모든 댓글 + 대댓글 삭제 */
    @Transactional
    void deleteByPostId(Long postId);

    /** 특정 댓글의 모든 대댓글 삭제 */
    @Transactional
    void deleteByParentId(Long parentId);


}
