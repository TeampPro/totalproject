package com.example.todo_caled.task.repository;

import com.example.todo_caled.task.entity.TaskShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskShareRepository extends JpaRepository<TaskShare, Long> {

    // 여러 Task에 대한 공유 정보 조회
    @Query("select ts from TaskShare ts where ts.task.id in :taskIds")
    List<TaskShare> findByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    // 특정 Task의 공유 정보 삭제
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("delete from TaskShare ts where ts.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
