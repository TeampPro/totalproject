package com.example.todo_caled.users.controller;

import com.example.todo_caled.users.dto.FriendDto;
import com.example.todo_caled.users.dto.FriendRequestCreateRequest;
import com.example.todo_caled.users.dto.FriendRequestDto;
import com.example.todo_caled.users.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    /** 친구 요청 보내기 */
    @PostMapping("/requests")
    public ResponseEntity<Void> requestFriend(@RequestBody FriendRequestCreateRequest req) {
        friendService.sendRequest(req);
        return ResponseEntity.ok().build();
    }

    /** 나에게 온 친구 요청 목록 */
    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDto>> incomingRequests(
            @RequestParam("userId") String loginId
    ) {
        return ResponseEntity.ok(friendService.getIncomingRequests(loginId));
    }

    /** 친구 목록 */
    @GetMapping
    public ResponseEntity<List<FriendDto>> friends(
            @RequestParam("userId") String loginId
    ) {
        return ResponseEntity.ok(friendService.getFriends(loginId));
    }

    /** 수락 */
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<Void> accept(
            @PathVariable Long requestId,
            @RequestParam("userId") String receiverId
    ) {
        friendService.acceptRequest(requestId, receiverId);
        return ResponseEntity.ok().build();
    }

    /** 거절 */
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable Long requestId,
            @RequestParam("userId") String receiverId
    ) {
        friendService.rejectRequest(requestId, receiverId);
        return ResponseEntity.ok().build();
    }
}
