package com.example.todo_caled.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "friendships",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_friend_pair",
                columnNames = {"requester_id", "receiver_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class Friendship {

    public enum Status {
        PENDING, ACCEPTED, REJECTED, CANCELED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 아이디(User.id)를 그대로 사용
    @Column(name = "requester_id", nullable = false, length = 50)
    private String requesterId;

    @Column(name = "receiver_id", nullable = false, length = 50)
    private String receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime respondedAt;
}
