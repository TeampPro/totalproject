package com.example.todo_caled.chat.controller;

import com.example.todo_caled.chat.dto.ChatMessageDto;
import com.example.todo_caled.chat.dto.ChatRoomRequestDto;
import com.example.todo_caled.chat.dto.ChatRoomResponseDto;
import com.example.todo_caled.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // ✅ 내가 참여한 방 목록
    @GetMapping("/rooms")
    public List<ChatRoomResponseDto> getMyRooms(@RequestParam String memberName) {
        return chatService.findRoomsForMember(memberName);
    }

    // ✅ roomId로 방 하나 조회 (채팅방 헤더 제목에 사용)
    @GetMapping("/rooms/{roomId}")
    public ChatRoomResponseDto getRoom(@PathVariable String roomId) {
        return chatService.getRoom(roomId);
    }

    // ✅ 방 생성 + 생성자를 멤버로 등록
    @PostMapping("/rooms")
    public ChatRoomResponseDto createRoom(@RequestParam String memberName,
                                          @RequestParam(required = false) String name) {
        return chatService.createRoomForMember(memberName, name);
    }

    // ✅ 특정 방에 입장(멤버 등록). 방 클릭할 때마다 호출 → 이후 WebSocket 연결
    @PostMapping("/rooms/{roomId}/join")
    public ChatRoomResponseDto joinRoom(@PathVariable String roomId,
                                        @RequestParam String memberName) {
        return chatService.joinRoom(roomId, memberName);
    }

    // ✅ 방 이름 수정
    @PatchMapping("/rooms/{roomId}/name")
    public ResponseEntity<ChatRoomResponseDto> renameRoom(
            @PathVariable String roomId,
            @RequestBody ChatRoomRequestDto requestDto
    ) {
        ChatRoomResponseDto response = chatService.renameRoom(roomId, requestDto.getName());
        return ResponseEntity.ok(response);
    }

    /** 특정 방의 이전 메시지 */
    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessageDto> getMessages(@PathVariable String roomId) {
        return chatService.getMessages(roomId);
    }

    // ✅ 초대 링크 생성
    @PostMapping("/rooms/{roomId}/invite")
    public String generateInvite(@PathVariable String roomId) {
        return chatService.generateInviteLink(roomId);
    }

    // ✅ 초대 링크(GET)로 입장 (브라우저에서 바로 접근)
    @GetMapping("/invite/{code}")
    public ChatRoomResponseDto joinByInviteGet(
            @PathVariable String code,
            @RequestParam(required = false) String memberName
    ) {
        if (memberName == null || memberName.isBlank()) {
            memberName = "GUEST";
        }
        return chatService.joinByInvite(code, memberName);
    }

    // ✅ 초대 코드(POST)로 입장
    @PostMapping("/invite/join")
    public ChatRoomResponseDto joinByInvite(@RequestParam String code,
                                            @RequestParam String memberName) {
        return chatService.joinByInvite(code, memberName);
    }

    // ✅ 로그인한 사용자가 자동으로 개인방 생성/재사용
    @PostMapping("/room/auto")
    public ChatRoomResponseDto createPersonalRoom(@RequestParam String memberName) {
        return chatService.createPersonalRoom(memberName);
    }

    // ✅ 채팅방 삭제
    @DeleteMapping("/rooms/{roomId}")
    public void deleteRoom(@PathVariable String roomId) {
        chatService.deleteRoom(roomId);
    }
}
