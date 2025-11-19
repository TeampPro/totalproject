package com.example.todo_caled.chat.service;

import com.example.todo_caled.chat.dto.ChatMessageDto;
import com.example.todo_caled.chat.dto.ChatRoomResponseDto;
import com.example.todo_caled.chat.entity.ChatMessage;
import com.example.todo_caled.chat.entity.ChatRoom;
import com.example.todo_caled.chat.entity.ChatRoomMember;
import com.example.todo_caled.chat.repository.ChatMessageRepository;
import com.example.todo_caled.chat.repository.ChatRoomMemberRepository;
import com.example.todo_caled.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

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

    /** roomId로 방 하나 조회 (제목 맞추는 데 사용) */
    public ChatRoomResponseDto getRoom(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        return ChatRoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .participantCount(room.getParticipantCount())
                .build();
    }

    public ChatRoomResponseDto createRoomForMember(String memberName, String roomName) {
        if (roomName == null || roomName.isBlank()) {
            roomName = memberName + "의 채팅방";
        }

        ChatRoom room = ChatRoom.builder()
                .id(UUID.randomUUID().toString())
                .name(roomName)
                .participantCount(1)
                .build();
        chatRoomRepository.save(room);

        chatRoomMemberRepository.save(ChatRoomMember.builder()
                .roomId(room.getId())
                .memberName(memberName)
                .joinedAt(LocalDateTime.now())
                .build());

        return ChatRoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .participantCount(room.getParticipantCount())
                .build();
    }

    // 내방 목록
    public List<ChatRoomResponseDto> findRoomsForMember(String memberName) {

        List<ChatRoomMember> joins = chatRoomMemberRepository.findByMemberName(memberName);

        List<String> roomIds = joins.stream()
                .map(ChatRoomMember::getRoomId)
                .distinct()
                .toList();

        List<ChatRoom> rooms = chatRoomRepository.findAllById(roomIds);

        return rooms.stream()
                .map(r -> ChatRoomResponseDto.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .participantCount(r.getParticipantCount())
                        .build())
                .collect(Collectors.toList());
    }

    /** 초대 링크 생성 (기존 방에서만 호출 가능) */
    public String generateInviteLink(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        String code = UUID.randomUUID().toString();
        room.setInviteCode(code);
        room.setInviteCreatedAt(LocalDateTime.now());
        room.setInviteExpiresAt(LocalDateTime.now().plusHours(24)); // 24시간 유효
        chatRoomRepository.save(room);

        return "/chat/invite/" + code; // 프론트에서 접근 가능한 링크
    }

    /** 초대 코드로 참가 */
    public ChatRoomResponseDto joinByInvite(String code, String memberName) {
        ChatRoom room = chatRoomRepository.findAll().stream()
                .filter(r -> code.equals(r.getInviteCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        if (room.getInviteExpiresAt() != null && room.getInviteExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("초대 코드가 만료되었습니다.");
        }

        // 이미 참여한 적이 없을 경우만 등록
        if (!chatRoomMemberRepository.existsByRoomIdAndMemberName(room.getId(), memberName)) {
            chatRoomMemberRepository.save(ChatRoomMember.builder()
                    .roomId(room.getId())
                    .memberName(memberName)
                    .joinedAt(LocalDateTime.now())
                    .build());

            room.setParticipantCount(room.getParticipantCount() + 1);
            chatRoomRepository.save(room);
        }

        return ChatRoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .participantCount(room.getParticipantCount())
                .build();
    }

    /** 방 멤버 여부 확인 (웹소켓 접속시 검증) */
    public boolean isMember(String roomId, String memberName) {
        return chatRoomMemberRepository.existsByRoomIdAndMemberName(roomId, memberName);
    }

    /** 로그인한 사용자가 채팅 버튼 누르면 자동 방 생성 */
    public ChatRoomResponseDto createPersonalRoom(String memberName) {
        // 이미 생성된 개인방이 있는지 확인 (중복 방지)
        List<ChatRoom> existing = chatRoomRepository.findAll().stream()
                .filter(r -> r.getName().equals(memberName + "의 채팅방"))
                .toList();

        if (!existing.isEmpty()) {
            ChatRoom room = existing.get(0);
            return ChatRoomResponseDto.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .participantCount(room.getParticipantCount())
                    .build();
        }

        // 없으면 새로 생성
        ChatRoom room = ChatRoom.builder()
                .id(UUID.randomUUID().toString())
                .name(memberName + "의 채팅방")
                .participantCount(1)
                .build();
        chatRoomRepository.save(room);

        // 본인 멤버 등록
        chatRoomMemberRepository.save(ChatRoomMember.builder()
                .roomId(room.getId())
                .memberName(memberName)
                .joinedAt(LocalDateTime.now())
                .build());

        return ChatRoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .participantCount(room.getParticipantCount())
                .build();
    }

    /** 메시지 저장 (WebSocket 핸들러에서 호출) */
    public void saveMessage(ChatMessageDto dto) {
        ChatMessage entity = ChatMessage.builder()
                .roomId(dto.getRoomId())
                .sender(dto.getSender())
                .message(dto.getMessage())
                .sentAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
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
                        .time(msg.getSentAt() != null ? msg.getSentAt().format(FORMATTER) : "")
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatRoomResponseDto renameRoom(String roomId, String newName) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        room.setName(newName);
        ChatRoom saved = chatRoomRepository.save(room);

        // participantCount는 엔티티 필드 그대로 사용
        return ChatRoomResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .participantCount(saved.getParticipantCount())
                .build();
    }

    // 채팅방 30일 제한 그이후에 삭제
    @Transactional
    public void cleanupOldMessages() {
        chatMessageRepository.deleteOldMessages(LocalDateTime.now().minusDays(30));
    }

    // 채팅방 삭제
    @Transactional
    public void deleteRoom(String roomId) {
        chatMessageRepository.deleteByRoomId(roomId);
        chatRoomMemberRepository.deleteByRoomId(roomId);
        chatRoomRepository.deleteById(roomId);
    }
}
