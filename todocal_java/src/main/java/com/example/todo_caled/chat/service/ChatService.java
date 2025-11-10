package com.example.todo_caled.chat.service;

import com.example.todo_caled.chat.dto.ChatMessageDto;
import com.example.todo_caled.chat.dto.ChatRoomResponseDto;
import com.example.todo_caled.chat.entity.ChatMessage;
import com.example.todo_caled.chat.entity.ChatRoom;
import com.example.todo_caled.chat.repository.ChatMessageRepository;
import com.example.todo_caled.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    /** 채팅방 생성 */
    public ChatRoomResponseDto createRoom(String name) {
        ChatRoom room = ChatRoom.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .participantCount(0)
                .build();
        chatRoomRepository.save(room);
        return ChatRoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .participantCount(room.getParticipantCount())
                .build();
    }

    /** 채팅방 목록 */
    public List<ChatRoomResponseDto> findAllRooms() {
        return chatRoomRepository.findAll().stream()
                .map(r -> ChatRoomResponseDto.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .participantCount(r.getParticipantCount())
                        .build())
                .collect(Collectors.toList());
    }

    /** 메시지 저장 (WebSocket 핸들러에서 호출) */
    public void saveMessage(ChatMessageDto dto) {
        ChatMessage entity = ChatMessage.builder()
                .roomId(dto.getRoomId())
                .sender(dto.getSender())
                .message(dto.getMessage())
                .sentAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(entity);
    }

    /** 특정 방의 이전 메시지 조회 */
    public List<ChatMessageDto> getMessages(String roomId) {
        return chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId).stream()
                .map(msg -> ChatMessageDto.builder()
                        .roomId(msg.getRoomId())
                        .sender(msg.getSender())
                        .message(msg.getMessage())
                        .time(msg.getSentAt().toString())
                        .build())
                .collect(Collectors.toList());
    }
}
