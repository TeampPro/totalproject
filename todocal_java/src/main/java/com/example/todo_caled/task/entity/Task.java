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

    private LocalDateTime promiseDate;   // 시작 시간

    private LocalDateTime endDateTime;   // 종료 시간

    private String location;

    private Boolean shared;

    @PrePersist
    public void prePersist() {
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (shared == null) shared = false;
    }
}
