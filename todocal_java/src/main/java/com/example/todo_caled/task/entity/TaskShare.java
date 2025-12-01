// src/main/java/com/example/todo_caled/task/entity/TaskShare.java
package com.example.todo_caled.task.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_shares")
public class TaskShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 일정인지
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // 공유 대상 유저 아이디 (문자열)
    @Column(name = "shared_user_id", length = 50, nullable = false)
    private String sharedUserId;

    private LocalDateTime createdAt = LocalDateTime.now();

    public TaskShare() {
    }

    public TaskShare(Task task, String sharedUserId) {
        this.task = task;
        this.sharedUserId = sharedUserId;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public String getSharedUserId() {
        return sharedUserId;
    }

    public void setSharedUserId(String sharedUserId) {
        this.sharedUserId = sharedUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
