package com.example.todo_caled.task.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
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
    private LocalDateTime promiseDate; // 날짜 + 시간

    private String location;          // 장소
    private Boolean shared;           // 공유 여부

    private Long ownerId;             // 추후 회원구분
    private Long calendarId;          // 캘린더 구분(필요시)

    public Task(String title, String content, LocalDateTime promiseDate) {
        this.title = title;
        this.content = content;
        this.createdDate = LocalDateTime.now();
        this.promiseDate = promiseDate;
    }

    @PrePersist
    public void onCreate() {
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (shared == null) shared = false;
    }
}
