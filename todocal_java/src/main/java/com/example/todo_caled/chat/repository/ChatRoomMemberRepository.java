// src/main/java/com/example/todo_caled/chat/repository/ChatRoomMemberRepository.java
package com.example.todo_caled.chat.repository;

import com.example.todo_caled.chat.entity.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {

    boolean existsByRoomIdAndMemberName(String roomId, String memberName);

    List<ChatRoomMember> findByMemberName(String memberName);

    void deleteByRoomId(String roomId);

    @Modifying
    @Query("UPDATE ChatRoomMember m SET m.memberName = :newName WHERE m.memberName = :oldName")
    void updateMemberName(@Param("oldName") String oldName, @Param("newName") String newName);
}