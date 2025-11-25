package com.example.todo_caled.users.service;

import com.example.todo_caled.users.dto.FriendDto;
import com.example.todo_caled.users.dto.FriendRequestCreateRequest;
import com.example.todo_caled.users.dto.FriendRequestDto;
import com.example.todo_caled.users.entity.Friendship;
import com.example.todo_caled.users.entity.Friendship.Status;
import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.FriendshipRepository;
import com.example.todo_caled.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    /** 친구 요청 보내기 */
    public void sendRequest(FriendRequestCreateRequest req) {
        if (req.getRequesterId().equals(req.getReceiverId())) {
            throw new IllegalArgumentException("본인에게는 친구 요청을 보낼 수 없습니다.");
        }

        // 유저 존재 여부 체크
        User from = userRepository.findById(req.getRequesterId());
        User to   = userRepository.findById(req.getReceiverId());
        if (from == null || to == null) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }

        // 이미 친구거나, 대기중인지 확인
        boolean exists = friendshipRepository.existsByRequesterIdAndReceiverIdAndStatusIn(
                req.getRequesterId(),
                req.getReceiverId(),
                Arrays.asList(Status.PENDING, Status.ACCEPTED)
        );
        boolean reverseExists = friendshipRepository.existsByRequesterIdAndReceiverIdAndStatusIn(
                req.getReceiverId(),
                req.getRequesterId(),
                Arrays.asList(Status.PENDING, Status.ACCEPTED)
        );
        if (exists || reverseExists) {
            throw new IllegalStateException("이미 친구이거나, 친구 요청이 대기 중입니다.");
        }

        Friendship friendship = new Friendship();
        friendship.setRequesterId(req.getRequesterId());
        friendship.setReceiverId(req.getReceiverId());
        friendship.setStatus(Status.PENDING);
        friendship.setCreatedAt(LocalDateTime.now());

        friendshipRepository.save(friendship);
    }

    /** 나에게 들어온 친구 요청 목록 (PENDING) */
    @Transactional(readOnly = true)
    public List<FriendRequestDto> getIncomingRequests(String receiverId) {
        List<Friendship> list =
                friendshipRepository.findByReceiverIdAndStatus(receiverId, Status.PENDING);

        return list.stream()
                .map(f -> {
                    User from = userRepository.findById(f.getRequesterId());
                    return new FriendRequestDto(
                            f.getId(),
                            from.getId(),
                            from.getName(),
                            from.getNickname(),
                            from.getUserType(),
                            from.getProfileImage()
                    );
                })
                .collect(Collectors.toList());
    }

    /** 친구 목록 조회 (ACCEPTED) */
    @Transactional(readOnly = true)
    public List<FriendDto> getFriends(String loginId) {
        List<Friendship> list = friendshipRepository.findAcceptedFriends(loginId);

        return list.stream()
                .map(f -> {
                    // 나 말고 "상대"를 찾기
                    String friendId = f.getRequesterId().equals(loginId)
                            ? f.getReceiverId()
                            : f.getRequesterId();

                    User friend = userRepository.findById(friendId);

                    return new FriendDto(
                            friend.getId(),
                            friend.getName(),
                            friend.getNickname(),
                            friend.getUserType(),
                            friend.getProfileImage()
                    );
                })
                .collect(Collectors.toList());
    }

    /** 수락 */
    public void acceptRequest(Long requestId, String receiverId) {
        Friendship friendship = friendshipRepository.findByIdAndReceiverId(requestId, receiverId)
                .orElseThrow(() -> new IllegalArgumentException("요청을 찾을 수 없습니다."));

        friendship.setStatus(Status.ACCEPTED);
        friendship.setRespondedAt(LocalDateTime.now());
    }

    /** 거절 */
    public void rejectRequest(Long requestId, String receiverId) {
        Friendship friendship = friendshipRepository.findByIdAndReceiverId(requestId, receiverId)
                .orElseThrow(() -> new IllegalArgumentException("요청을 찾을 수 없습니다."));

        friendship.setStatus(Status.REJECTED);
        friendship.setRespondedAt(LocalDateTime.now());
    }
}
