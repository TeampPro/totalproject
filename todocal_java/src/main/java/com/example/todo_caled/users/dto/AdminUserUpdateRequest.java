package com.example.todo_caled.users.dto;

public class AdminUserUpdateRequest {

    private String name;        // 이름
    private String nickname;    // 닉네임 (지금은 서버에서 안 쓸 수도 있음)
    private String userType;    // NORMAL / GUEST / ADMIN 등

    // 🔥 관리자에서 새 비밀번호로 재설정할 때 사용하는 필드
    private String newPassword;

    // getter / setter
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
