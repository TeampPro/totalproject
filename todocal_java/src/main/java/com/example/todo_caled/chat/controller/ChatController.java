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

    @PostMapping("/rooms")
    public ChatRoomResponseDto createRoom(@RequestParam String memberName,
                                          @RequestParam(required = false) String name) {
        return chatService.createRoomForMember(memberName, name);
    }

    // 방 이름 수정 API
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

    @PostMapping("/rooms/{roomId}/invite")
    public String generateInvite(@PathVariable String roomId) {
        return chatService.generateInviteLink(roomId);
    }

    @GetMapping("/invite/{code}")
    public ChatRoomResponseDto joinByInviteGet(
            @PathVariable String code,
            @RequestParam(required = false) String memberName
    ) {
        if (memberName == null || memberName.isBlank()) {
            memberName = "guest";
        }
        return chatService.joinByInvite(code, memberName);
    }

    @PostMapping("/invite/join")
    public ChatRoomResponseDto joinByInvite(@RequestParam String code,
                                            @RequestParam String memberName) {
        return chatService.joinByInvite(code, memberName);
    }

    @PostMapping("/room/auto")
    public ChatRoomResponseDto createPersonalRoom(@RequestParam String memberName) {
        return chatService.createPersonalRoom(memberName);
    }

    @DeleteMapping("/rooms/{roomId}")
    public void deleteRoom(@PathVariable String roomId) {
        chatService.deleteRoom(roomId);
    }
}
