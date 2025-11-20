package com.example.todo_caled.users.service;

import com.example.todo_caled.board.repository.PostRepository;
import com.example.todo_caled.comments.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public void updateNicknameForAll(String oldId, String oldName, String oldNickname, String newNickname) {

        postRepository.updateWriterAll(oldId, oldName, oldNickname, newNickname);
        commentRepository.updateWriterAll(oldId, oldName, oldNickname, newNickname);
    }
}
