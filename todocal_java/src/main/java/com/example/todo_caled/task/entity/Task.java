package com.example.todo_caled.task.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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

<<<<<<< HEAD
=======
>>>>>>> origin/login
    private LocalDateTime promiseDate;   // 시작 시간
    private LocalDateTime endDateTime;   // 종료 시간 ★ 추가

    @Column(length = 50)
    private String ownerId;              // 일정 작성자 아이디

    private Boolean shared;              // 공유 여부

    // 기본 생성자
    public Task() {
        this.createdDate = LocalDateTime.now();
    }
<<<<<<< HEAD
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


=======

    // ★ InitData에서 쓰는 3개짜리 생성자
    //    new Task("제목", "내용", LocalDateTime.of(...))
    public Task(String title, String content, LocalDateTime promiseDate) {
        this(title, content, promiseDate, null, true);
    }

    // ★ 새 로직용 5개짜리 생성자 (ownerId / shared 포함)
>>>>>>> origin/login
    public Task(String title, String content, LocalDateTime promiseDate, String ownerId, Boolean shared) {
        this.title = title;
        this.content = content;
        this.createdDate = LocalDateTime.now();
        this.promiseDate = promiseDate;
<<<<<<< HEAD
=======
        // 종료 시간 기본값: 시작 + 1시간
        this.endDateTime = (promiseDate != null) ? promiseDate.plusHours(1) : null;
>>>>>>> origin/login
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

<<<<<<< HEAD
=======
    public LocalDateTime getEndDateTime() { return endDateTime; }        // ★ 추가
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

>>>>>>> origin/login
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public Boolean getShared() { return shared; }
    public void setShared(Boolean shared) { this.shared = shared; }
<<<<<<< HEAD
>>>>>>> origin/login
=======
>>>>>>> origin/login
}
