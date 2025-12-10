package com.example.todo_caled.task.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    private LocalDateTime promiseDate;   // 시작 시간
    private LocalDateTime endDateTime;   // 종료 시간 ★ 추가

    @Column(length = 50)
    private String ownerId;              // 일정 작성자 아이디

    private Boolean shared;              // 공유 여부

    // 🔹 약속 장소 (프론트의 location 필드와 매핑)
    @Column(length = 255)
    private String location;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    // -----------------------------
    // ★ 특정 친구 공유용 관계 / 요청용 필드
    // -----------------------------
    @JsonIgnore
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskShare> shares = new ArrayList<>();

    // 요청 바디에서만 사용 (DB에는 저장 X)
    @Transient
    private List<String> sharedUserIds;

    public Task() {
        this.createdDate = LocalDateTime.now();
    }

    public Task(String title, String content, LocalDateTime promiseDate) {
        // 초기 데이터는 ownerId = null, shared = true 로 넣음 (공유 일정 취급)
        this(title, content, promiseDate, null, true);
    }

    // ★ 새 로직용 5개짜리 생성자 (ownerId / shared 포함)
    public Task(String title, String content, LocalDateTime promiseDate, String ownerId, Boolean shared) {
        this.title = title;
        this.content = content;
        this.createdDate = LocalDateTime.now();
        this.promiseDate = promiseDate;
        // 종료 시간 기본값: 시작 + 1시간
        this.endDateTime = (promiseDate != null) ? promiseDate.plusHours(1) : null;
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

    public LocalDateTime getEndDateTime() { return endDateTime; }        // ★ 추가
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public Boolean getShared() { return shared; }
    public void setShared(Boolean shared) { this.shared = shared; }

    // 🔹 location getter/setter
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public List<TaskShare> getShares() {
        return shares;
    }

    public void setShares(List<TaskShare> shares) {
        this.shares = shares;
    }

    public List<String> getSharedUserIds() {
        return sharedUserIds;
    }

    public void setSharedUserIds(List<String> sharedUserIds) {
        this.sharedUserIds = sharedUserIds;
    }
}
