package com.example.todo_caled.users.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Table(name = "users")
@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId; // 기본 키 (자동 증가)

    @Column(nullable = false, unique = true, length = 50)
    private String id; // 로그인용 아이디

    @Column(nullable = false, length = 255)
    private String password; // BCrypt 해시 저장용 (길이 늘림)

    @Column(length = 100)
    private String email; // 비회원 가능

    @Column(length = 50)
    private String name; // 비회원 가능

    @Column(length = 50)
    private String nickname;  // 닉네임

    @Column(length = 100)
    private String kakaoId;

    @Column(length = 100)
    private String kakaoEmail;

    /**
     * userType 규칙 통일:
     *  - NORMAL : 일반 회원
     *  - GUEST  : 비회원 (비회원 로그인)
     *  - ADMIN  : 관리자
     *  - KAKAO  : 카카오 로그인 회원 (프로젝트에 따라)
     *
     * 기본값은 NORMAL.
     */
    @Column(nullable = false, length = 20)
    private String userType = "NORMAL";

    @Column(length = 255)
    private String profileImage; // 프로필 이미지 파일명

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
