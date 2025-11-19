package com.example.todo_caled.task.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String content;

    private LocalDateTime createdDate;

<<<<<<< HEAD
    private LocalDateTime promiseDate;   // 시작 시간

    private LocalDateTime endDateTime;   // 종료 시간

    private String location;

    private Boolean shared;

    @PrePersist
    public void prePersist() {
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (shared == null) shared = false;
    }
=======
    @Column(length = 50)
    private String ownerId;

    private Boolean shared;

    public Task() {
        this.createdDate = LocalDateTime.now();
    }
    public Task(String title, String content, LocalDateTime promiseDate) {
        // 초기 데이터는 ownerId = null, shared = true 로 넣음 (공유 일정 취급)
        this(title, content, promiseDate, null, true);
    }


    public Task(String title, String content, LocalDateTime promiseDate, String ownerId, Boolean shared) {
        this.title = title;
        this.content = content;
        this.createdDate = LocalDateTime.now();
        this.promiseDate = promiseDate;
        this.ownerId = ownerId;
        this.shared = shared;
    }

    // Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getPromiseDate() { return promiseDate; }
    public void setPromiseDate(LocalDateTime promiseDate) { this.promiseDate = promiseDate; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public Boolean getShared() { return shared; }
    public void setShared(Boolean shared) { this.shared = shared; }
>>>>>>> origin/login
}
