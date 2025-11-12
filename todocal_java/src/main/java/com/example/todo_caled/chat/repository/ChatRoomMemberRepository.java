package com.example.todo_caled.chat.repository;

import com.example.todo_caled.chat.entity.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    boolean existsByRoomIdAndMemberName(String roomId, String memberName);
}
