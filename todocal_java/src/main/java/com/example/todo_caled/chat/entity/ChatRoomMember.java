package com.example.todo_caled.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(indexes = {
        @Index(name = "idx_room_member", columnList = "roomId, memberName", unique = true)
})
public class ChatRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId;
    private String memberName;       // 인증 연동 전까지는 닉네임/ 아이디 문자열 기준

    private LocalDateTime joinedAt;
}
