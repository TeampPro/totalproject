package com.example.todo_caled.todolist.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "todo")
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long todoId;

    private String title;
    private String content;

    // ✅ LocalDate <-> "yyyy-MM-dd" 양방향 직렬화/역직렬화 지원
    @JsonProperty("tDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate tDate;

    // ✅ 문자열 입력 대응 (DB 미매핑)
    @Transient
    private String tDateString;

    private String status;
    private Boolean sCheck;

    private Long ownerId;       // FK user.id
    private Long calendarId;    // FK calendar.id
}
