package com.example.todo_caled.users.service;

import com.example.todo_caled.comments.repository.CommentRepository;
import com.example.todo_caled.board.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    /**
     * 닉네임 변경 시,
     *  - 게시판 글(writer)
     *  - 댓글(writer)
     * 에 저장해 둔 작성자 정보를 한 번에 바꾸는 메서드.
     *
     * 컨트롤러에서는 이 메서드만 호출하고,
     * 실제 쿼리는 repository 레벨에만 두도록 해서 중복 제거.
     */
    @Transactional
    public void updateNicknameForAll(
            String oldId,
            String oldName,
            String oldNickname,
            String newNickname
    ) {
        // 게시글 작성자 업데이트
        postRepository.updateWriterAll(oldId, oldName, oldNickname, newNickname);

        // 댓글 작성자 업데이트
        commentRepository.updateWriterAll(oldId, oldName, oldNickname, newNickname);
    }
}
