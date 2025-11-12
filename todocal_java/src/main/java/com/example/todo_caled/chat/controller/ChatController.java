package com.example.todo_caled.chat.controller;

import com.example.todo_caled.chat.dto.ChatMessageDto;
import com.example.todo_caled.chat.dto.ChatRoomRequestDto;
import com.example.todo_caled.chat.dto.ChatRoomResponseDto;
import com.example.todo_caled.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /** 채팅방 목록 (지금은 사용안함) */
//    @GetMapping("/rooms")
//    public List<ChatRoomResponseDto> getRooms() {
//        return chatService.findAllRooms();
//    }

    /** 채팅방 생성 (지금은 사용안함) */
//    @PostMapping("/rooms")
//    public ChatRoomResponseDto createRoom(@RequestBody ChatRoomRequestDto request) {
//        return chatService.createRoom(request.getName());
//    }

    /** 특정 방의 이전 메시지 */
    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessageDto> getMessages(@PathVariable String roomId) {
        return chatService.getMessages(roomId);
    }

    @PostMapping("/rooms/{roomId}/invite")
    public String generateInvite(@PathVariable String roomId) {
        return chatService.generateInviteLink(roomId);
    }

    @PostMapping("/invite/join")
    public ChatRoomResponseDto joinByInvite(@RequestParam String code, @RequestParam String memberName) {
        return chatService.joinByInvite(code, memberName);
    }

    @PostMapping("/room/auto")
    public ChatRoomResponseDto createPersonalRoom(@RequestParam String memberName) {
        return chatService.createPersonalRoom(memberName);
    }
}
