package com.example.todo_caled.users.service;

import com.example.todo_caled.comments.repository.CommentRepository;
import com.example.todo_caled.board.repository.PostRepository;
import com.example.todo_caled.chat.repository.ChatRoomMemberRepository;
import com.example.todo_caled.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * 닉네임 변경 시 게시글 / 댓글 / 채팅에 표시되는 작성자/참여자 이름을
     * 한 번에 갱신하는 메서드.
     *
     * oldId       : 변경 전 사용자 id (일반/카카오 공통)
     * oldName     : 변경 전 이름
     * oldNickname : 변경 전 닉네임 (없을 수 있음)
     * newNickname : 새 닉네임
     */
    @Transactional
    public void updateNicknameForAll(
            String oldId,
            String oldName,
            String oldNickname,
            String newNickname
    ) {
        // 1) 게시글 작성자 업데이트
        postRepository.updateWriterAll(oldId, oldName, oldNickname, newNickname);

        // 2) 댓글 작성자 업데이트
        commentRepository.updateWriterAll(oldId, oldName, oldNickname, newNickname);

        // 3) 채팅방 멤버 이름 업데이트
        //    채팅 참여 시 memberName 으로 id / name / nickname 셋 중 하나를 사용했을 수 있음
        if (oldId != null && !oldId.isBlank()) {
            chatRoomMemberRepository.updateMemberName(oldId, newNickname);
            chatMessageRepository.updateSenderName(oldId, newNickname);
        }
        if (oldName != null && !oldName.isBlank()) {
            chatRoomMemberRepository.updateMemberName(oldName, newNickname);
            chatMessageRepository.updateSenderName(oldName, newNickname);
        }
        if (oldNickname != null && !oldNickname.isBlank()) {
            chatRoomMemberRepository.updateMemberName(oldNickname, newNickname);
            chatMessageRepository.updateSenderName(oldNickname, newNickname);
        }
    }
}
