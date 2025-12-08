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

    /** 단순 방 생성(멤버 등록 X) - 필요 없으면 안 써도 됨 */
    @Transactional
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

    /** 전체 채팅방 목록 (관리자 용 등) */
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public ChatRoomResponseDto getRoom(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        return ChatRoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .participantCount(room.getParticipantCount())
                .build();
    }

    /** 채팅방 생성 + 생성자를 멤버로 등록 */
    @Transactional
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

    /** 내가 속한 방 목록 */
    @Transactional(readOnly = true)
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
    @Transactional
    public String generateInviteLink(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        String code = UUID.randomUUID().toString();
        room.setInviteCode(code);
        room.setInviteCreatedAt(LocalDateTime.now());
        room.setInviteExpiresAt(LocalDateTime.now().plusHours(24)); // 24시간 유효
        chatRoomRepository.save(room);

        // 프론트 라우트에 맞춰서 필요하면 "/chat/..." 부분은 수정
        return "/chat/invite/" + code;
    }

    /** 초대 코드로 참가 */
    @Transactional
    public ChatRoomResponseDto joinByInvite(String code, String memberName) {
        // 성능상으론 findByInviteCode(...) 를 쓰는 게 좋지만,
        // 현재 구조를 최대한 유지해서 findAll() + filter 사용
        ChatRoom room = chatRoomRepository.findAll().stream()
                .filter(r -> code.equals(r.getInviteCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        if (room.getInviteExpiresAt() != null &&
                room.getInviteExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("초대 코드가 만료되었습니다.");
        }

        // 초대 입장도 결국 joinRoom 로직 재사용
        return joinRoom(room.getId(), memberName);
    }

    /** 방 멤버 여부 확인 (웹소켓 접속시 검증) */
    @Transactional(readOnly = true)
    public boolean isMember(String roomId, String memberName) {
        return chatRoomMemberRepository.existsByRoomIdAndMemberName(roomId, memberName);
    }

    /** 방에 입장(멤버 등록). 이미 있으면 그대로 두고, 없으면 새로 추가 */
    @Transactional
    public ChatRoomResponseDto joinRoom(String roomId, String memberName) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        boolean exists = chatRoomMemberRepository.existsByRoomIdAndMemberName(roomId, memberName);

        if (!exists) {
            chatRoomMemberRepository.save(ChatRoomMember.builder()
                    .roomId(roomId)
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

    /** 로그인한 사용자가 채팅 버튼 누르면 자동 방 생성/재사용 */
    @Transactional
    public ChatRoomResponseDto createPersonalRoom(String memberName) {
        // 이미 생성된 개인방이 있는지 확인 (중복 방지)
        List<ChatRoom> existing = chatRoomRepository.findAll().stream()
                .filter(r -> r.getName().equals(memberName + "의 채팅방"))
                .toList();

        if (!existing.isEmpty()) {
            ChatRoom room = existing.get(0);

            // 혹시 개인방인데 멤버 테이블에 없으면 joinRoom 으로 보정
            joinRoom(room.getId(), memberName);

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
    @Transactional
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
    @Transactional(readOnly = true)
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

    /** 방 이름 변경 */
    @Transactional
    public ChatRoomResponseDto renameRoom(String roomId, String newName) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        room.setName(newName);
        ChatRoom saved = chatRoomRepository.save(room);

        return ChatRoomResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .participantCount(saved.getParticipantCount())
                .build();
    }

    /** 채팅 메시지 30일 지난 것 삭제 */
    @Transactional
    public void cleanupOldMessages() {
        chatMessageRepository.deleteOldMessages(LocalDateTime.now().minusDays(30));
    }

    /** 채팅방 삭제 (메시지, 멤버 모두 함께 삭제) */
    @Transactional
    public void deleteRoom(String roomId) {
        chatMessageRepository.deleteByRoomId(roomId);
        chatRoomMemberRepository.deleteByRoomId(roomId);
        chatRoomRepository.deleteById(roomId);
    }

    /** 방 나가기
     *  - 방 생성자(제일 먼저 join 한 사람)가 나가면: 방 전체 삭제
     *  - 일반 참여자가 나가면: 해당 멤버만 삭제, 방은 유지
     */
    @Transactional
    public void leaveOrDeleteRoom(String roomId, String memberName) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        // 방 멤버 목록 (입장 순)
        List<ChatRoomMember> members =
                chatRoomMemberRepository.findByRoomIdOrderByJoinedAtAsc(roomId);

        if (members.isEmpty()) {
            // 멤버 정보가 없으면 안전하게 방만 삭제
            deleteRoom(roomId);
            return;
        }

        // ✅ 방 생성자: 제일 먼저 join 한 멤버
        ChatRoomMember owner = members.get(0);

        // 생성자가 나가기를 누른 경우 → 방 전체 삭제
        if (owner.getMemberName().equals(memberName)) {
            deleteRoom(roomId);
            return;
        }

        // 일반 참여자: 본인 멤버만 삭제
        ChatRoomMember me = members.stream()
                .filter(m -> m.getMemberName().equals(memberName))
                .findFirst()
                .orElse(null);

        if (me == null) {
            // 이미 멤버가 아닌 경우는 그냥 무시
            return;
        }

        chatRoomMemberRepository.delete(me);
        int newCount = Math.max(room.getParticipantCount() - 1, 0);
        room.setParticipantCount(newCount);
        chatRoomRepository.save(room);
    }
}
