package com.example.todo_caled.chat.repository;

import com.example.todo_caled.chat.entity.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    boolean existsByRoomIdAndMemberName(String roomId, String memberName);
    List<ChatRoomMember> findByMemberName(String memberName);
    void deleteByRoomId(String roomId);

}
