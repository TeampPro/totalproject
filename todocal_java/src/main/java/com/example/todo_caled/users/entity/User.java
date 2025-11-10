package com.example.todo_caled.entity;

import jakarta.persistence.*;
import lombok.Data;

@Table(name = "users")
@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId; // PK

    @Column(nullable = false, unique = true)
    private String id; // 로그인용 아이디

    @Column(nullable = false)
    private String password;

    @Column
    private String email; // 비회원은 공백 가능

    @Column
    private String name; // 비회원은 공백 가능

    @Column
    private String kakaoId; // 카카오톡 아이디

    @Column
    private String kakaoEmail; // 카카오톡 이메일

    @Column(nullable = false)
    private String userType = "NORMAL"; // NORMAL or GUEST
}
