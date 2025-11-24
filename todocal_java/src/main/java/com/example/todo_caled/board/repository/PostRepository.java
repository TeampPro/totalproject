package com.example.todo_caled.board.repository;

import com.example.todo_caled.board.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 특정 카테고리 글 리스트
    List<Post> findByCategoryOrderByCreatedAtDesc(String category);

    @Query("SELECT p FROM Post p " +
            "WHERE (:category IS NULL OR p.category = :category) " +
            "AND (:title IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
            "AND (:writer IS NULL OR LOWER(p.writer) LIKE LOWER(CONCAT('%', :writer, '%'))) " +
            "AND (:content IS NULL OR LOWER(p.content) LIKE LOWER(CONCAT('%', :content, '%'))) " +
            "AND (:start IS NULL OR p.createdAt >= :start) " +
            "AND (:end IS NULL OR p.createdAt <= :end) " +
            "ORDER BY p.createdAt DESC")
    List<Post> searchFilter(
            @Param("category") String category,
            @Param("title") String title,
            @Param("writer") String writer,
            @Param("content") String content,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Transactional
    @Modifying
    @Query("UPDATE Post p SET p.writer = :newWriter " +
            "WHERE p.writer IN (:oldId, :oldName, :oldNickname)")
    void updateWriterAll(
            @Param("oldId") String oldId,
            @Param("oldName") String oldName,
            @Param("oldNickname") String oldNickname,
            @Param("newWriter") String newWriter
    );

    // 이전글 (현재 id보다 작은 것 중 가장 큰 id)
    Post findTopByIdLessThanOrderByIdDesc(Long id);

    // 다음글 (현재 id보다 큰 것 중 가장 작은 id)
    Post findTopByIdGreaterThanOrderByIdAsc(Long id);

    // 🔥 특정 작성자가 쓴 모든 게시글 조회
    List<Post> findByWriter(String writer);

    // 🔥 특정 작성자가 쓴 모든 게시글 삭제
    @Transactional
    @Modifying
    @Query("DELETE FROM Post p WHERE p.writer = :writer")
    void deleteByWriter(@Param("writer") String writer);
}
