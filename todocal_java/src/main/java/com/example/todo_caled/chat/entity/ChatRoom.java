package com.example.todo_caled.chat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {

    @Id
    private String id;

    private String name;
    private int participantCount;

    // 초대 전용 코드 (UUID)
    @Column(unique = true)
    private String inviteCode;

    // 초대 코드 생성/만료 (필요없으면 null 허용)
    private LocalDateTime inviteCreatedAt;
    private LocalDateTime inviteExpiresAt;
}
