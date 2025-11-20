package com.example.todo_caled.users.dto;

public class AdminUserDto {

    private String id;           // 로그인 아이디 (User.id)
    private String name;         // 이름
    private String nickname;     // 닉네임
    private String userType;     // NORMAL / GUEST / ADMIN 등
    private long activityCount;  // 활동 내역(일정 수)

    public AdminUserDto(String id, String name, String nickname, String userType, long activityCount) {
        this.id = id;
        this.name = name;
        this.nickname = nickname;
        this.userType = userType;
        this.activityCount = activityCount;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getNickname() {
        return nickname;
    }

    public String getUserType() {
        return userType;
    }

    public long getActivityCount() {
        return activityCount;
    }
}
