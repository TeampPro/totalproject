package com.example.todo_caled.task.repository;

import com.example.todo_caled.task.entity.TaskShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskShareRepository extends JpaRepository<TaskShare, Long> {

    // 여러 Task에 대한 공유 정보 한 번에 조회
    List<TaskShare> findByTaskIdIn(List<Long> taskIds);

    // 특정 Task의 공유 정보 삭제
    void deleteByTaskId(Long taskId);
}
