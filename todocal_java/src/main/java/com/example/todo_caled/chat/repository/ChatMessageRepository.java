package com.example.todo_caled.chat.repository;

import com.example.todo_caled.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByRoomIdOrderBySentAtAsc(String roomId);

    void deleteByRoomId(String roomId);

    @Modifying
    @Query("DELETE FROM ChatMessage m WHERE m.sentAt < :threshold")
    void deleteOldMessages(LocalDateTime threshold);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.sender = :newName WHERE m.sender = :oldName")
    void updateSenderName(@Param("oldName") String oldName, @Param("newName") String newName);
}